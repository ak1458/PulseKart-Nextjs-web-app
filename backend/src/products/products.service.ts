import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { CreateProductDto } from './dto/create-product.dto';

export interface ProductWithStock extends Product {
    stock: number;
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Batch)
        private batchRepository: Repository<Batch>,
        private dataSource: DataSource,
    ) { }

    async create(createProductDto: any): Promise<Product> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const p = new Product();
            p.sku = createProductDto.sku;
            p.title = createProductDto.title;
            p.category = createProductDto.category;
            p.description = createProductDto.description || '';
            p.price = createProductDto.price;
            p.mrp = createProductDto.mrp;
            p.tax_rate = createProductDto.tax_rate || 0;
            p.prescription_required = createProductDto.prescription_required || false;
            p.attributes = createProductDto.attributes || {};
            p.images = createProductDto.images || [];
            p.seo = createProductDto.seo || {};

            const savedProduct = await queryRunner.manager.save(p);

            // Create initial batch record for stock
            const batch = new Batch();
            batch.sku_id = savedProduct.id;
            batch.qty_available = createProductDto.stock || 0;
            batch.batch_no = 'INITIAL';
            batch.warehouse_id = 1; // Default warehouse
            batch.expiry_date = new Date(new Date().setFullYear(new Date().getFullYear() + 2)); // 2 years from now
            await queryRunner.manager.save(batch);

            await queryRunner.commitTransaction();
            return savedProduct;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(
        limit = 50,
        offset = 0,
        filters: {
            category?: string;
            search?: string;
            minPrice?: number;
            maxPrice?: number;
        } = {},
    ): Promise<ProductWithStock[]> {
        const query = this.productRepository
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
            .groupBy('p.id')
            .limit(limit)
            .offset(offset);

        if (filters.category) {
            query.andWhere('p.category = :category', { category: filters.category });
        }

        if (filters.search) {
            query.andWhere('(p.title ILIKE :search OR p.sku ILIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        if (filters.minPrice !== undefined) {
            query.andWhere('p.price >= :minPrice', { minPrice: filters.minPrice });
        }

        if (filters.maxPrice !== undefined) {
            query.andWhere('p.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }

        const rawResults = await query.getRawMany();

        return rawResults.map((raw) => ({
            id: raw.p_id as number,
            sku: raw.p_sku as string,
            title: raw.p_title as string,
            category: raw.p_category as string,
            description: raw.p_description as string,
            price: Number(raw.p_price),
            mrp: Number(raw.p_mrp),
            tax_rate: Number(raw.p_tax_rate),
            prescription_required: !!raw.p_prescription_required,
            attributes: raw.p_attributes,
            images: raw.p_images,
            seo: raw.p_seo,
            is_active: !!raw.p_is_active,
            created_at: raw.p_created_at as Date,
            updated_at: raw.p_updated_at as Date,
            stock: Number(raw.stock || 0),
        })) as any;
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
            price: Number(raw.p_price),
            mrp: Number(raw.p_mrp),
            tax_rate: Number(raw.p_tax_rate),
            prescription_required: !!raw.p_prescription_required,
            attributes: raw.p_attributes,
            images: raw.p_images,
            seo: raw.p_seo,
            is_active: !!raw.p_is_active,
            created_at: raw.p_created_at as Date,
            updated_at: raw.p_updated_at as Date,
            stock: Number(raw.stock || 0),
        } as any;
    }

    async remove(id: number): Promise<void> {
        await this.productRepository.delete(id);
    }
}
