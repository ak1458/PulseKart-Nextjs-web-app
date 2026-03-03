import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import type { ReviewStatus } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { CreateReviewDto, UpdateReviewDto } from '../dto/create-review.dto';

export interface ReviewFilterOptions {
  productId?: number;
  userId?: number;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Validate rating
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewRepository.create(createReviewDto);
    return this.reviewRepository.save(review);
  }

  async findAll(
    limit: number = 50,
    offset: number = 0,
    filters?: ReviewFilterOptions,
  ): Promise<Review[]> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (filters?.productId) {
      queryBuilder.andWhere('review.productId = :productId', {
        productId: filters.productId,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('review.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('review.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.minRating !== undefined) {
      queryBuilder.andWhere('review.rating >= :minRating', {
        minRating: filters.minRating,
      });
    }

    if (filters?.maxRating !== undefined) {
      queryBuilder.andWhere('review.rating <= :maxRating', {
        maxRating: filters.maxRating,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async findByProductId(
    productId: number,
    status: ReviewStatus = 'approved',
  ): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId, status },
      order: { helpfulCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    if (updateReviewDto.rating !== undefined) {
      if (updateReviewDto.rating < 1 || updateReviewDto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  async approve(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.status = 'approved';
    return this.reviewRepository.save(review);
  }

  async reject(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.status = 'rejected';
    return this.reviewRepository.save(review);
  }

  async markHelpful(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.helpfulCount++;
    return this.reviewRepository.save(review);
  }

  async getProductRatingSummary(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const reviews = await this.reviewRepository.find({
      where: { productId, status: 'approved' },
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      distribution[review.rating]++;
    });

    return {
      averageRating: parseFloat((sumRating / totalReviews).toFixed(2)),
      totalReviews,
      ratingDistribution: distribution,
    };
  }
}
