import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/create-category.dto';

export interface CategoryTreeNode extends Category {
    children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }

    async findTree(): Promise<CategoryTreeNode[]> {
        const categories = await this.categoryRepository.find({
            order: { sortOrder: 'ASC', name: 'ASC' },
        });

        const buildTree = (parentId: number | null): CategoryTreeNode[] => {
            return categories
                .filter((cat) => cat.parentId === parentId)
                .map((cat) => ({
                    ...cat,
                    children: buildTree(cat.id),
                }));
        };

        return buildTree(null);
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children'],
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async findBySlug(slug: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { slug },
            relations: ['children'],
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        Object.assign(category, updateCategoryDto);
        return this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<void> {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
    }

    async findProductsByCategoryId(categoryId: number): Promise<Product[]> {
        // Get all subcategory IDs recursively
        const getAllSubcategoryIds = async (parentId: number): Promise<number[]> => {
            const children = await this.categoryRepository.find({ where: { parentId } });
            const childIds = children.map((c) => c.id);
            const grandChildIds = await Promise.all(
                childIds.map((id) => getAllSubcategoryIds(id))
            );
            return [parentId, ...childIds, ...grandChildIds.flat()];
        };

        const allCategoryIds = await getAllSubcategoryIds(categoryId);

        return this.productRepository
            .createQueryBuilder('product')
            .innerJoin('product.categories', 'category')
            .where('category.id IN (:...categoryIds)', { categoryIds: allCategoryIds })
            .andWhere('product.is_active = :isActive', { isActive: true })
            .orderBy('product.created_at', 'DESC')
            .getMany();
    }
}
