import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedItem } from './entities/saved-item.entity';

@Injectable()
export class SavedItemsService {
    constructor(
        @InjectRepository(SavedItem)
        private readonly savedItemRepository: Repository<SavedItem>,
    ) { }

    async findAllForUser(userId: number): Promise<SavedItem[]> {
        return this.savedItemRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Save a product.
     *
     * Idempotent: saving something already saved returns the existing row
     * rather than raising on the unique constraint, because pressing a heart
     * twice is not an error the customer should see.
     */
    async add(userId: number, productId: number): Promise<SavedItem> {
        const existing = await this.savedItemRepository.findOne({
            where: { userId, productId },
        });
        if (existing) return existing;

        const item = this.savedItemRepository.create({ userId, productId });
        return this.savedItemRepository.save(item);
    }

    async remove(userId: number, productId: number): Promise<void> {
        const result = await this.savedItemRepository.delete({ userId, productId });
        if (!result.affected) {
            throw new NotFoundException('That item is not in your saved list');
        }
    }
}
