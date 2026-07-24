import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
    let service: OrdersService;

    const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
    };

    const mockOrderRepository = {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    /**
     * Runs the transaction callback against an in-memory manager and returns
     * whatever entity `manager.create(Order, ...)` was handed, so tests can
     * assert on the values the service derived rather than the ones it was sent.
     */
    let createdOrder: Record<string, unknown> | undefined;

    const mockManager = {
        create: jest.fn((entity: unknown, data: Record<string, unknown>) => {
            if (entity === Order) createdOrder = data;
            return data;
        }),
        save: jest.fn(async (data: unknown) => (Array.isArray(data) ? data : { id: 'ord_1', ...(data as object) })),
        findOne: jest.fn(async () => ({ id: 'ord_1' })),
        delete: jest.fn(),
    };

    const mockDataSource = {
        transaction: jest.fn(async (cb: (m: typeof mockManager) => unknown) => cb(mockManager)),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        createdOrder = undefined;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
                { provide: getRepositoryToken(OrderItem), useValue: { } },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
    });

    describe('findAll sorting', () => {
        it('ignores a sortBy that is not an allow-listed column', async () => {
            // orderBy() is interpolated into SQL, not bound, so an arbitrary
            // string here would be an injection point.
            await service.findAll({
                sortBy: 'id; DROP TABLE orders; --',
            } as never);

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.createdAt', 'DESC');
        });

        it('honours an allow-listed column and direction', async () => {
            await service.findAll({ sortBy: 'totalAmount', sortOrder: 'ASC' } as never);

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.totalAmount', 'ASC');
        });

        it('falls back to DESC for an unrecognised sort direction', async () => {
            await service.findAll({ sortBy: 'status', sortOrder: 'sideways' } as never);

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('order.status', 'DESC');
        });
    });

    describe('findAll pagination', () => {
        it('clamps the page size to the maximum', async () => {
            await service.findAll({ limit: '100000' } as never);

            expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
        });

        it('survives non-numeric pagination input', async () => {
            // parseInt('abc') is NaN, and skip(NaN) throws at the driver.
            await service.findAll({ page: 'abc', limit: 'xyz' } as never);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
        });
    });

    describe('create', () => {
        const baseDto = (overrides: Partial<CreateOrderDto> = {}): CreateOrderDto => ({
            totalAmount: 0,
            items: [
                { productId: 'p1', name: 'Paracetamol', price: 19.99, quantity: 3 },
                { productId: 'p2', name: 'Bandage', price: 5.5, quantity: 2 },
            ],
            ...overrides,
        }) as CreateOrderDto;

        it('derives totals from the line items and ignores a client-supplied total', async () => {
            // 19.99*3 + 5.5*2 = 59.97 + 11.00 = 70.97
            await service.create(baseDto({ totalAmount: 1 }));

            expect(createdOrder).toMatchObject({
                subtotalAmount: 70.97,
                totalAmount: 70.97,
                itemsCount: 5,
            });
        });

        it('rounds to 2dp so the total matches the sum of the persisted lines', async () => {
            // 19.99 * 3 is 59.970000000000006 in binary floating point.
            await service.create(baseDto({ items: [
                { productId: 'p1', name: 'Paracetamol', price: 19.99, quantity: 3 },
            ] } as Partial<CreateOrderDto>));

            expect(createdOrder!.subtotalAmount).toBe(59.97);
        });

        it('adds tax and shipping and subtracts discount', async () => {
            await service.create(baseDto({
                taxAmount: 5,
                shippingAmount: 40,
                discountAmount: 10,
            }));

            expect(createdOrder).toMatchObject({ totalAmount: 105.97 });
        });

        it('rejects a discount larger than the order value', async () => {
            await expect(
                service.create(baseDto({ discountAmount: 10_000 })),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('rejects an order with no items', async () => {
            await expect(
                service.create(baseDto({ items: [] })),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('defaults status and payment status', async () => {
            await service.create(baseDto());

            expect(createdOrder).toMatchObject({
                status: OrderStatus.CREATED,
                paymentStatus: PaymentStatus.PENDING,
            });
        });
    });
});
