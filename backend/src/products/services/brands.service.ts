import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dto/create-brand.dto';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private brandRepository: Repository<Brand>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createBrandDto: CreateBrandDto): Promise<Brand> {
        const brand = this.brandRepository.create(createBrandDto);
        return this.brandRepository.save(brand);
    }

    async findAll(): Promise<Brand[]> {
        return this.brandRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Brand> {
        const brand = await this.brandRepository.findOne({ where: { id } });
        if (!brand) {
            throw new NotFoundException('Brand not found');
        }
        return brand;
    }

    async findBySlug(slug: string): Promise<Brand> {
        const brand = await this.brandRepository.findOne({ where: { slug } });
        if (!brand) {
            throw new NotFoundException('Brand not found');
        }
        return brand;
    }

    async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
        const brand = await this.findOne(id);
        Object.assign(brand, updateBrandDto);
        return this.brandRepository.save(brand);
    }

    async remove(id: number): Promise<void> {
        const brand = await this.findOne(id);
        await this.brandRepository.remove(brand);
    }

    async findProductsByBrandId(brandId: number): Promise<Product[]> {
        return this.productRepository.find({
            where: { brandId, is_active: true },
            order: { created_at: 'DESC' },
        });
    }
}
