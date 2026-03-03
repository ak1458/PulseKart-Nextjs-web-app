import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { CreateProductDto } from './dto/create-product.dto';

interface FilterOptions {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductWithStock {
  id: number;
  sku: string;
  title: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  tax_rate: number;
  prescription_required: boolean;
  attributes: Record<string, unknown>;
  images: string[];
  seo: Record<string, unknown>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  stock: number;
  batches?: Batch[];
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Create Product
      const product = manager.create(Product, {
        sku: createProductDto.sku,
        title: createProductDto.title,
        category: createProductDto.category,
        description: createProductDto.description,
        price: createProductDto.price,
        mrp: createProductDto.mrp,
        tax_rate: createProductDto.tax_rate,
        prescription_required: createProductDto.prescription_required,
        attributes: createProductDto.attributes,
        images: createProductDto.images,
        seo: createProductDto.seo,
      });

      const savedProduct = await manager.save(product);

      // 2. Add Initial Stock if provided
      if (createProductDto.stock && createProductDto.stock > 0) {
        const batch = manager.create(Batch, {
          sku_id: savedProduct.id,
          warehouse_id: 1, // Default warehouse for MVP
          qty_available: createProductDto.stock,
          batch_no: `BATCH-${savedProduct.sku}-INIT`,
          expiry_date: new Date('2026-12-31'), // Default expiry
        });
        await manager.save(batch);
      }

      return savedProduct;
    });
  }

  async findAll(
    limit: number = 50,
    offset: number = 0,
    filters?: FilterOptions,
  ): Promise<ProductWithStock[]> {
    // Build query with JOIN to avoid N+1 problem
    const queryBuilder = this.productRepository
      .createQueryBuilder('p')
      .leftJoin('p.batches', 'b')
      .select([
        'p.id',
        'p.sku',
        'p.title',
        'p.category',
        'p.description',
        'p.price',
        'p.mrp',
        'p.tax_rate',
        'p.prescription_required',
        'p.attributes',
        'p.images',
        'p.seo',
        'p.is_active',
        'p.created_at',
        'p.updated_at',
      ])
      .addSelect('COALESCE(SUM(b.qty_available), 0)', 'stock')
      .where('p.is_active = :isActive', { isActive: true })
      .groupBy('p.id');

    // Apply filters
    if (filters?.category && filters.category !== 'All Products') {
      queryBuilder.andWhere('p.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(LOWER(p.title) LIKE LOWER(:search) OR LOWER(p.description) LIKE LOWER(:search) OR LOWER(p.sku) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) {
      queryBuilder.andWhere('p.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      queryBuilder.andWhere('p.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    // Execute query with pagination
    const entities = await queryBuilder
      .orderBy('p.created_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getRawMany();

    // Map raw results to entities with stock
    return entities.map((raw: Record<string, unknown>) => ({
      id: raw.p_id as number,
      sku: raw.p_sku as string,
      title: raw.p_title as string,
      category: raw.p_category as string,
      description: raw.p_description as string,
      price: raw.p_price as number,
      mrp: raw.p_mrp as number,
      tax_rate: raw.p_tax_rate as number,
      prescription_required: raw.p_prescription_required as boolean,
      attributes: raw.p_attributes as Record<string, unknown>,
      images: raw.p_images as string[],
      seo: raw.p_seo as Record<string, unknown>,
      is_active: raw.p_is_active as boolean,
      created_at: raw.p_created_at as Date,
      updated_at: raw.p_updated_at as Date,
      stock: Number(raw.stock || 0),
    }));
  }

  async findOne(id: number): Promise<ProductWithStock | null> {
    const raw = await this.productRepository
      .createQueryBuilder('p')
      .leftJoin('p.batches', 'b')
      .select([
        'p.id',
        'p.sku',
        'p.title',
        'p.category',
        'p.description',
        'p.price',
        'p.mrp',
        'p.tax_rate',
        'p.prescription_required',
        'p.attributes',
        'p.images',
        'p.seo',
        'p.is_active',
        'p.created_at',
        'p.updated_at',
      ])
      .addSelect('COALESCE(SUM(b.qty_available), 0)', 'stock')
      .where('p.id = :id', { id })
      .groupBy('p.id')
      .getRawOne();

    if (!raw) return null;

    return {
      id: raw.p_id as number,
      sku: raw.p_sku as string,
      title: raw.p_title as string,
      category: raw.p_category as string,
      description: raw.p_description as string,
      price: raw.p_price as number,
      mrp: raw.p_mrp as number,
      tax_rate: raw.p_tax_rate as number,
      prescription_required: raw.p_prescription_required as boolean,
      attributes: raw.p_attributes as Record<string, unknown>,
      images: raw.p_images as string[],
      seo: raw.p_seo as Record<string, unknown>,
      is_active: raw.p_is_active as boolean,
      created_at: raw.p_created_at as Date,
      updated_at: raw.p_updated_at as Date,
      stock: Number(raw.stock || 0),
    };
  }
}
