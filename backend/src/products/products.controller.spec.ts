import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
    let controller: ProductsController;
    let service: ProductsService;

    const mockProductsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
            ],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
        service = module.get<ProductsService>(ProductsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a product with valid payload', async () => {
            const createDto = {
                sku: 'TEST-001',
                name: 'Test Product',
                category: 'Medicines',
                description: 'A test product',
                price: 100,
                mrp: 120,
                stock: 50,
                tax_rate: 18,
                prescription_required: false,
            };

            const expectedResult = {
                id: 1,
                ...createDto,
                title: 'Test Product',
                created_at: new Date(),
            };

            mockProductsService.create.mockResolvedValue(expectedResult);

            const result = await controller.create(createDto as any);

            expect(result).toEqual(expectedResult);
            expect(mockProductsService.create).toHaveBeenCalledWith({
                ...createDto,
                title: 'Test Product',
                tax_rate: 18,
                prescription_required: false,
            });
        });

        it('should use name as title when title is not provided', async () => {
            const createDto = {
                sku: 'TEST-002',
                name: 'Named Product',
                category: 'Wellness',
                price: 50,
                mrp: 60,
                stock: 25,
            };

            mockProductsService.create.mockResolvedValue({ id: 2, ...createDto });

            await controller.create(createDto as any);

            expect(mockProductsService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Named Product',
                })
            );
        });
    });

    describe('findAll', () => {
        it('should return array of products with default pagination', async () => {
            const mockProducts = [
                { id: 1, sku: 'P1', title: 'Product 1', stock: 10 },
                { id: 2, sku: 'P2', title: 'Product 2', stock: 20 },
            ];

            mockProductsService.findAll.mockResolvedValue(mockProducts);

            const result = await controller.findAll('', '');

            expect(result).toEqual(mockProducts);
            expect(mockProductsService.findAll).toHaveBeenCalledWith(50, 0, {
                category: undefined,
                search: undefined,
                minPrice: undefined,
                maxPrice: undefined,
            });
        });

        it('should pass limit and offset to service', async () => {
            mockProductsService.findAll.mockResolvedValue([]);

            await controller.findAll('10', '20');

            expect(mockProductsService.findAll).toHaveBeenCalledWith(10, 20, {
                category: undefined,
                search: undefined,
                minPrice: undefined,
                maxPrice: undefined,
            });
        });

        it('should pass filter parameters to service', async () => {
            mockProductsService.findAll.mockResolvedValue([]);

            await controller.findAll('10', '0', 'Medicines', 'aspirin', '100', '500');

            expect(mockProductsService.findAll).toHaveBeenCalledWith(10, 0, {
                category: 'Medicines',
                search: 'aspirin',
                minPrice: 100,
                maxPrice: 500,
            });
        });
    });

    describe('findOne', () => {
        it('should return a product by id', async () => {
            const mockProduct = { id: 1, sku: 'P1', title: 'Product 1', stock: 50 };

            mockProductsService.findOne.mockResolvedValue(mockProduct);

            const result = await controller.findOne('1');

            expect(result).toEqual(mockProduct);
            expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when product not found', async () => {
            mockProductsService.findOne.mockResolvedValue(null);

            await expect(controller.findOne('999')).rejects.toThrow('Product not found');
        });
    });
});
