import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';

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
      expect(mockManager.create).toHaveBeenCalledWith(
        Product,
        expect.objectContaining({
          sku: 'TEST-001',
          title: 'Test Product',
          price: 100,
        }),
      );
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
        create: jest
          .fn()
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
      expect(mockManager.create).toHaveBeenLastCalledWith(
        Batch,
        expect.objectContaining({
          sku_id: 2,
          qty_available: 100,
          batch_no: 'BATCH-TEST-002-INIT',
        }),
      );
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
      expect(mockManager.create).toHaveBeenCalledWith(
        Product,
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return products with calculated stock', async () => {
      const mockEntities = [
        { id: 1, sku: 'P1', title: 'Product 1' },
        { id: 2, sku: 'P2', title: 'Product 2' },
      ];

      const mockRaw = [
        { p_id: '1', stock: '50' }, // Note: raw values are strings
        { p_id: '2', stock: '30' },
      ];

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockEntities,
          raw: mockRaw,
        }),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAll(50, 0);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ ...mockEntities[0], stock: 50 });
      expect(result[1]).toEqual({ ...mockEntities[1], stock: 30 });
    });

    it('should handle type mismatch between p_id (string) and entity.id (number)', async () => {
      const mockEntities = [{ id: 123, sku: 'P123', title: 'Product 123' }];
      const mockRaw = [{ p_id: '123', stock: '45' }]; // p_id is string from raw query

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockEntities,
          raw: mockRaw,
        }),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAll(10, 0);

      // Stock should be correctly matched despite string/number type difference
      expect(result[0].stock).toBe(45);
    });

    it('should default stock to 0 when no batch matches', async () => {
      const mockEntities = [{ id: 1, sku: 'P1', title: 'No Batch Product' }];
      const mockRaw = [{ p_id: '999', stock: '100' }]; // Different ID

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockEntities,
          raw: mockRaw,
        }),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAll(10, 0);

      expect(result[0].stock).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return product with stock by id', async () => {
      const mockEntity = { id: 1, sku: 'P1', title: 'Single Product' };
      const mockRaw = { p_id: '1', stock: '75' };

      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: [mockEntity],
          raw: [mockRaw],
        }),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findOne(1);

      expect(result).toEqual({ ...mockEntity, stock: 75 });
    });

    it('should return null when product not found', async () => {
      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: [],
          raw: [],
        }),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});
