import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SizeGuide, SizeMeasurement } from '../entities/size-guide.entity';
import { Category } from '../entities/category.entity';
import { CreateSizeGuideDto, UpdateSizeGuideDto } from '../dto/create-size-guide.dto';

@Injectable()
export class SizeGuidesService {
    constructor(
        @InjectRepository(SizeGuide)
        private sizeGuideRepository: Repository<SizeGuide>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async create(createSizeGuideDto: CreateSizeGuideDto): Promise<SizeGuide> {
        const sizeGuide = this.sizeGuideRepository.create(createSizeGuideDto);
        return this.sizeGuideRepository.save(sizeGuide);
    }

    async findAll(): Promise<SizeGuide[]> {
        return this.sizeGuideRepository.find({
            relations: ['category'],
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number): Promise<SizeGuide> {
        const sizeGuide = await this.sizeGuideRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!sizeGuide) {
            throw new NotFoundException('Size guide not found');
        }
        return sizeGuide;
    }

    async update(id: number, updateSizeGuideDto: UpdateSizeGuideDto): Promise<SizeGuide> {
        const sizeGuide = await this.findOne(id);
        Object.assign(sizeGuide, updateSizeGuideDto);
        return this.sizeGuideRepository.save(sizeGuide);
    }

    async remove(id: number): Promise<void> {
        const sizeGuide = await this.findOne(id);
        await this.sizeGuideRepository.remove(sizeGuide);
    }

    async findByCategoryId(categoryId: number): Promise<SizeGuide[]> {
        return this.sizeGuideRepository.find({
            where: { categoryId },
            relations: ['category'],
            order: { name: 'ASC' },
        });
    }

    async findByCategorySlug(slug: string): Promise<SizeGuide[]> {
        const category = await this.categoryRepository.findOne({
            where: { slug },
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return this.findByCategoryId(category.id);
    }
}
