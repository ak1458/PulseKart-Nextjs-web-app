import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';

/**
 * Build a chainable SelectQueryBuilder stub.
 *
 * The previous tests hand-rolled a fresh object literal per case, listing only
 * the chain methods that implementation happened to call at the time. When the
 * service later added `.leftJoin()`, `.select()` and `.groupBy()`, every one of
 * those literals started throwing "is not a function" - five tests were failing
 * on main. Declaring the whole chain in one place keeps the stub honest.
 *
 * @param terminals Resolved values for the methods that end a chain, e.g.
 *                  `{ getRawMany: [...] }` or `{ getRawOne: undefined }`.
 */
function createMockQueryBuilder(terminals: Record<string, unknown>) {
    const chainMethods = [
        'select', 'addSelect', 'leftJoin', 'leftJoinAndSelect', 'innerJoin',
        'where', 'andWhere', 'orWhere', 'groupBy', 'addGroupBy',
        'orderBy', 'addOrderBy', 'take', 'skip', 'limit', 'offset',
    ];

    const qb: Record<string, jest.Mock> = {};
    for (const method of chainMethods) {
        qb[method] = jest.fn().mockReturnThis();
    }
    for (const [method, value] of Object.entries(terminals)) {
        qb[method] = jest.fn().mockResolvedValue(value);
    }
    return qb;
}

describe('ProductsService', () => {
    let service: ProductsService;

    // Mock repositories
    const mockProductRepository = {
        createQueryBuilder: jest.fn(),
    };

    const mockBatchRepository = {};

    // Mock DataSource with transaction support
    const mockDataSource = {
        transaction: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
                {
                    provide: getRepositoryToken(Batch),
                    useValue: mockBatchRepository,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a product within a transaction', async () => {
            const createDto = {
                sku: 'TEST-001',
                title: 'Test Product',
                category: 'Medicines',
                price: 100,
                mrp: 120,
                stock: 50,
                tax_rate: 18,
                prescription_required: false,
            };

            const savedProduct = { id: 1, ...createDto };

            const mockManager = {
                create: jest.fn().mockReturnValue(savedProduct),
                save: jest.fn().mockResolvedValue(savedProduct),
            };

            mockDataSource.transaction.mockImplementation(async (callback) => {
                return callback(mockManager);
            });

            const result = await service.create(createDto as any);

            expect(result).toEqual(savedProduct);
            expect(mockDataSource.transaction).toHaveBeenCalled();
            expect(mockManager.create).toHaveBeenCalledWith(Product, expect.objectContaining({
                sku: 'TEST-001',
                title: 'Test Product',
                price: 100,
            }));
        });

        it('should create initial batch when stock > 0', async () => {
            const createDto = {
                sku: 'TEST-002',
                title: 'Stocked Product',
                category: 'Wellness',
                price: 50,
                mrp: 60,
                stock: 100, // Has stock
            };

            const savedProduct = { id: 2, sku: 'TEST-002' };

            const mockManager = {
                create: jest.fn()
                    .mockReturnValueOnce(savedProduct) // Product
                    .mockReturnValueOnce({ batch_no: 'BATCH-TEST-002-INIT' }), // Batch
                save: jest.fn().mockResolvedValue(savedProduct),
            };

            mockDataSource.transaction.mockImplementation(async (callback) => {
                return callback(mockManager);
            });

            await service.create(createDto as any);

            // Should create both product and batch
            expect(mockManager.create).toHaveBeenCalledTimes(2);
            expect(mockManager.create).toHaveBeenLastCalledWith(Batch, expect.objectContaining({
                sku_id: 2,
                qty_available: 100,
                batch_no: 'BATCH-TEST-002-INIT',
            }));
        });

        it('should not create batch when stock is 0', async () => {
            const createDto = {
                sku: 'TEST-003',
                title: 'No Stock Product',
                category: 'Devices',
                price: 200,
                mrp: 250,
                stock: 0, // No stock
            };

            const savedProduct = { id: 3, sku: 'TEST-003' };

            const mockManager = {
                create: jest.fn().mockReturnValue(savedProduct),
                save: jest.fn().mockResolvedValue(savedProduct),
            };

            mockDataSource.transaction.mockImplementation(async (callback) => {
                return callback(mockManager);
            });

            await service.create(createDto as any);

            // Should only create product, not batch
            expect(mockManager.create).toHaveBeenCalledTimes(1);
            expect(mockManager.create).toHaveBeenCalledWith(Product, expect.any(Object));
        });
    });

    describe('findAll', () => {
        it('should map raw rows and coerce stock to a number', async () => {
            // Postgres returns SUM() and every selected column as a string.
            mockProductRepository.createQueryBuilder.mockReturnValue(
                createMockQueryBuilder({
                    getRawMany: [
                        { p_id: 1, p_sku: 'P1', p_title: 'Product 1', stock: '50' },
                        { p_id: 2, p_sku: 'P2', p_title: 'Product 2', stock: '30' },
                    ],
                }),
            );

            const result = await service.findAll(50, 0);

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({ id: 1, sku: 'P1', title: 'Product 1', stock: 50 });
            expect(result[1]).toMatchObject({ id: 2, sku: 'P2', title: 'Product 2', stock: 30 });
        });

        it('should default stock to 0 when a product has no batches', async () => {
            // COALESCE yields '0', and a product with no batch rows can also
            // come back with stock null depending on the join.
            mockProductRepository.createQueryBuilder.mockReturnValue(
                createMockQueryBuilder({
                    getRawMany: [
                        { p_id: 1, p_sku: 'P1', p_title: 'No Batch', stock: null },
                    ],
                }),
            );

            const result = await service.findAll(10, 0);

            expect(result[0].stock).toBe(0);
        });

        it('should return an empty array when no products match', async () => {
            mockProductRepository.createQueryBuilder.mockReturnValue(
                createMockQueryBuilder({ getRawMany: [] }),
            );

            await expect(service.findAll(10, 0)).resolves.toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return the product with stock by id', async () => {
            mockProductRepository.createQueryBuilder.mockReturnValue(
                createMockQueryBuilder({
                    getRawOne: {
                        p_id: 1,
                        p_sku: 'P1',
                        p_title: 'Single Product',
                        p_prescription_required: true,
                        stock: '75',
                    },
                }),
            );

            const result = await service.findOne(1);

            expect(result).toMatchObject({
                id: 1,
                sku: 'P1',
                title: 'Single Product',
                prescription_required: true,
                stock: 75,
            });
        });

        it('should return null when product not found', async () => {
            mockProductRepository.createQueryBuilder.mockReturnValue(
                createMockQueryBuilder({ getRawOne: undefined }),
            );

            await expect(service.findOne(999)).resolves.toBeNull();
        });
    });
});
