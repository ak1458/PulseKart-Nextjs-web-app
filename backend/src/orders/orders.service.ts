import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFiltersDto } from './dto/order-filters.dto';

/**
 * Columns that may be used to sort order listings.
 *
 * TypeORM interpolates orderBy() straight into the generated SQL - it is not a
 * bound parameter - so this value can never come directly from a query string.
 */
const SORTABLE_COLUMNS = new Set([
    'createdAt',
    'updatedAt',
    'totalAmount',
    'status',
    'paymentStatus',
    'itemsCount',
]);

const DEFAULT_SORT_COLUMN = 'createdAt';
const MAX_PAGE_SIZE = 100;

/**
 * Round to 2 decimal places to match the `decimal(10,2)` money columns.
 *
 * Without this, binary floating point leaks into totals: 19.99 * 3 is
 * 59.970000000000006, which Postgres then rounds on write, so the persisted
 * total no longer equals the sum of the persisted line items.
 *
 * Accepts strings because node-postgres returns `decimal` columns as strings to
 * avoid precision loss - entities declare these fields as `number`, but an
 * order loaded from the database actually carries `"5.00"`. Adding a number to
 * that string would concatenate and then coerce to NaN.
 */
function round2(value: number | string | null | undefined): number {
    const n = typeof value === 'number' ? value : Number(value ?? 0);
    if (!Number.isFinite(n)) return 0;
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly dataSource: DataSource,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const { items, ...orderData } = createOrderDto;

        if (!items || items.length === 0) {
            throw new BadRequestException('An order must contain at least one item');
        }

        // Use transaction to ensure atomicity
        return this.dataSource.transaction(async (manager) => {
            // Every money field below is derived server-side. The request may
            // carry totalAmount/subtotalAmount, but those are treated as
            // untrusted: previously they were spread straight onto the entity,
            // so the caller decided what the order was worth.
            //
            // NOTE: item unit prices are still taken from the request. That is
            // acceptable only while this endpoint is admin-only (manual order
            // entry may reference off-catalogue items). Before exposing order
            // creation to customers, unit price MUST be resolved from the
            // products table by productId, or price tampering becomes trivial.
            const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotalAmount = round2(
                items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            );

            const taxAmount = round2(orderData.taxAmount ?? 0);
            const shippingAmount = round2(orderData.shippingAmount ?? 0);
            const discountAmount = round2(orderData.discountAmount ?? 0);

            if (discountAmount > subtotalAmount + taxAmount + shippingAmount) {
                throw new BadRequestException(
                    'Discount cannot exceed the order value',
                );
            }

            const totalAmount = round2(
                subtotalAmount + taxAmount + shippingAmount - discountAmount,
            );

            // Create order
            const order = manager.create(Order, {
                ...orderData,
                itemsCount,
                subtotalAmount,
                taxAmount,
                shippingAmount,
                discountAmount,
                totalAmount,
                status: orderData.status || OrderStatus.CREATED,
                paymentStatus: orderData.paymentStatus || PaymentStatus.PENDING,
            });

            const savedOrder = await manager.save(order);

            // Create order items if provided
            if (items && items.length > 0) {
                const orderItems = items.map((item) =>
                    manager.create(OrderItem, {
                        ...item,
                        orderId: savedOrder.id,
                        totalPrice: round2(item.price * item.quantity),
                    }),
                );
                await manager.save(orderItems);
            }

            // Return the complete order with relations
            return manager.findOne(Order, {
                where: { id: savedOrder.id },
                relations: ['user', 'items', 'items.product'],
            }) as Promise<Order>;
        });
    }

    async findAll(filters?: OrderFiltersDto): Promise<Order[]> {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.paymentStatus) {
            where.paymentStatus = filters.paymentStatus;
        }

        if (filters?.userId) {
            where.userId = filters.userId;
        }

        if (filters?.startDate && filters?.endDate) {
            where.createdAt = Between(
                new Date(filters.startDate),
                new Date(filters.endDate),
            );
        }

        // Build query
        const queryBuilder = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .where(where);

        // Search by order ID or customer name
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`;
            queryBuilder.andWhere(
                '(order.id ILIKE :search OR order.customerName ILIKE :search OR order.guestName ILIKE :search)',
                { search: searchTerm },
            );
        }

        // Sorting. Both operands are validated against fixed sets rather than
        // interpolated, because orderBy() is not parameterised.
        const requestedSort = filters?.sortBy ?? DEFAULT_SORT_COLUMN;
        const sortBy = SORTABLE_COLUMNS.has(requestedSort)
            ? requestedSort
            : DEFAULT_SORT_COLUMN;
        const sortOrder = filters?.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

        // Pagination. Guard against NaN, zero, negatives and unbounded pages -
        // `parseInt('abc')` is NaN, and `skip(NaN)` throws at the driver.
        const parsedPage = parseInt(filters?.page ?? '1', 10);
        const parsedLimit = parseInt(filters?.limit ?? '50', 10);
        const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
            ? Math.min(parsedLimit, MAX_PAGE_SIZE)
            : 50;
        queryBuilder.skip((page - 1) * limit).take(limit);

        return queryBuilder.getMany();
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['user', 'items', 'items.product'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const { items, ...orderData } = updateOrderDto;

        // Use transaction for atomic updates
        return this.dataSource.transaction(async (manager) => {
            // Find order within transaction
            const order = await manager.findOne(Order, {
                where: { id },
                relations: ['items'],
            });

            if (!order) {
                throw new NotFoundException(`Order with ID "${id}" not found`);
            }

            // Update order fields
            Object.assign(order, orderData);

            // Recalculate money fields when the line items change, so the
            // stored totals cannot drift away from the items they describe.
            if (items) {
                order.itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
                order.subtotalAmount = round2(
                    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                );
                order.totalAmount = round2(
                    order.subtotalAmount +
                    round2(order.taxAmount ?? 0) +
                    round2(order.shippingAmount ?? 0) -
                    round2(order.discountAmount ?? 0),
                );

                // Remove existing items and create new ones
                await manager.delete(OrderItem, { orderId: id });

                const orderItems = items.map((item) =>
                    manager.create(OrderItem, {
                        ...item,
                        orderId: id,
                        totalPrice: round2(item.price * item.quantity),
                    }),
                );
                await manager.save(orderItems);
            }

            // Update timestamps based on status changes
            if (orderData.status === OrderStatus.SHIPPED && !order.shippedAt) {
                order.shippedAt = new Date();
            }
            if (orderData.status === OrderStatus.DELIVERED && !order.deliveredAt) {
                order.deliveredAt = new Date();
            }

            return manager.save(order);
        });
    }

    async remove(id: string): Promise<void> {
        const order = await this.findOne(id);
        await this.orderRepository.remove(order);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id);
        order.status = status;

        if (status === OrderStatus.SHIPPED && !order.shippedAt) {
            order.shippedAt = new Date();
        }
        if (status === OrderStatus.DELIVERED && !order.deliveredAt) {
            order.deliveredAt = new Date();
        }

        return this.orderRepository.save(order);
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
        const order = await this.findOne(id);
        order.paymentStatus = paymentStatus;
        return this.orderRepository.save(order);
    }

    async importOrders(orders: CreateOrderDto[]): Promise<{ imported: number; errors: string[] }> {
        const errors: string[] = [];
        let imported = 0;

        for (const orderData of orders) {
            try {
                await this.create(orderData);
                imported++;
            } catch (error) {
                errors.push(`Failed to import order: ${error.message}`);
            }
        }

        return { imported, errors };
    }

    async getOrderStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        totalRevenue: number;
        todayOrders: number;
    }> {
        const total = await this.orderRepository.count();

        const byStatus: Record<string, number> = {};
        for (const status of Object.values(OrderStatus)) {
            byStatus[status] = await this.orderRepository.count({ where: { status } });
        }

        const revenueResult = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
            .getRawOne();
        const totalRevenue = parseFloat(revenueResult?.total || '0');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await this.orderRepository.count({
            where: {
                createdAt: Between(today, new Date()),
            },
        });

        return {
            total,
            byStatus,
            totalRevenue,
            todayOrders,
        };
    }
}
