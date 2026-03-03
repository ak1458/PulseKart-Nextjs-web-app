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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, ...orderData } = createOrderDto;

    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      // Calculate items count
      const itemsCount =
        items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      // Create order
      const order = manager.create(Order, {
        ...orderData,
        itemsCount,
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
            totalPrice: item.price * item.quantity,
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
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
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

    // Sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'DESC';
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

    // Pagination
    const page = parseInt(filters?.page || '1', 10);
    const limit = parseInt(filters?.limit || '50', 10);
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

      // Update items count if items provided
      if (items) {
        order.itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

        // Remove existing items and create new ones
        await manager.delete(OrderItem, { orderId: id });

        const orderItems = items.map((item) =>
          manager.create(OrderItem, {
            ...item,
            orderId: id,
            totalPrice: item.price * item.quantity,
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

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.paymentStatus = paymentStatus;
    return this.orderRepository.save(order);
  }

  async importOrders(
    orders: CreateOrderDto[],
  ): Promise<{ imported: number; errors: string[] }> {
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
      byStatus[status] = await this.orderRepository.count({
        where: { status },
      });
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
