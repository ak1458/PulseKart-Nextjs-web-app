import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { Product } from '../entities/product.entity';
import { CreateTagDto, UpdateTagDto } from '../dto/create-tag.dto';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createTagDto: CreateTagDto): Promise<Tag> {
        const tag = this.tagRepository.create(createTagDto);
        return this.tagRepository.save(tag);
    }

    async findAll(): Promise<Tag[]> {
        return this.tagRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Tag> {
        const tag = await this.tagRepository.findOne({ where: { id } });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        return tag;
    }

    async findBySlug(slug: string): Promise<Tag> {
        const tag = await this.tagRepository.findOne({ where: { slug } });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        return tag;
    }

    async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
        const tag = await this.findOne(id);
        Object.assign(tag, updateTagDto);
        return this.tagRepository.save(tag);
    }

    async remove(id: number): Promise<void> {
        const tag = await this.findOne(id);
        await this.tagRepository.remove(tag);
    }

    async findProductsByTagId(tagId: number): Promise<Product[]> {
        const tag = await this.tagRepository.findOne({
            where: { id: tagId },
            relations: ['products'],
        });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        return tag.products.filter((p) => p.is_active);
    }
}
