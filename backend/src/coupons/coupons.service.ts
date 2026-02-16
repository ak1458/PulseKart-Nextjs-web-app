import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
    CouponValidationResponse,
    CouponListResponse,
    CouponFilters,
    PaginationOptions,
} from './dto/coupon-response.dto';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponRepository: Repository<Coupon>,
        @InjectRepository(CouponUsage)
        private couponUsageRepository: Repository<CouponUsage>,
    ) { }

    async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
        // Check if code already exists
        const existingCoupon = await this.couponRepository.findOne({
            where: { code: createCouponDto.code.toUpperCase() },
        });

        if (existingCoupon) {
            throw new BadRequestException('Coupon code already exists');
        }

        const coupon = new Coupon();
        coupon.code = createCouponDto.code.toUpperCase();
        coupon.description = createCouponDto.description ?? null;
        coupon.type = createCouponDto.type;
        coupon.value = createCouponDto.value;
        coupon.min_order_amount = createCouponDto.min_order_amount ?? null;
        coupon.max_discount_amount = createCouponDto.max_discount_amount ?? null;
        coupon.usage_limit = createCouponDto.usage_limit ?? 0;
        coupon.usage_count = 0;
        coupon.per_user_limit = createCouponDto.per_user_limit ?? 1;
        coupon.start_date = createCouponDto.start_date ? new Date(createCouponDto.start_date) : null;
        coupon.end_date = createCouponDto.end_date ? new Date(createCouponDto.end_date) : null;
        coupon.is_active = createCouponDto.is_active ?? true;
        coupon.applicable_products = createCouponDto.applicable_products ?? 'all';
        coupon.applicable_product_ids = createCouponDto.applicable_product_ids ?? [];
        coupon.applicable_categories = createCouponDto.applicable_categories ?? [];
        coupon.excluded_products = createCouponDto.excluded_products ?? [];

        return this.couponRepository.save(coupon);
    }

    async findAll(
        filters?: CouponFilters,
        pagination?: PaginationOptions,
    ): Promise<{ coupons: CouponListResponse[]; total: number; page: number; limit: number }> {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 50;
        const skip = (page - 1) * limit;

        const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

        // Apply filters
        if (filters?.is_active !== undefined) {
            queryBuilder.andWhere('coupon.is_active = :isActive', {
                isActive: filters.is_active,
            });
        }

        if (filters?.type) {
            queryBuilder.andWhere('coupon.type = :type', { type: filters.type });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(LOWER(coupon.code) LIKE LOWER(:search) OR LOWER(coupon.description) LIKE LOWER(:search))',
                { search: `%${filters.search}%` },
            );
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const coupons = await queryBuilder
            .orderBy('coupon.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();

        return {
            coupons: coupons.map((coupon) => this.mapToResponse(coupon)),
            total,
            page,
            limit,
        };
    }

    async findOne(id: string): Promise<CouponListResponse> {
        const coupon = await this.couponRepository.findOne({ where: { id } });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return this.mapToResponse(coupon);
    }

    async findByCode(code: string): Promise<Coupon | null> {
        return this.couponRepository.findOne({
            where: { code: code.toUpperCase() },
        });
    }

    async update(id: string, updateCouponDto: UpdateCouponDto): Promise<CouponListResponse> {
        const coupon = await this.couponRepository.findOne({ where: { id } });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        // If code is being updated, check for duplicates
        if (updateCouponDto.code && updateCouponDto.code.toUpperCase() !== coupon.code) {
            const existingCoupon = await this.couponRepository.findOne({
                where: { code: updateCouponDto.code.toUpperCase() },
            });
            if (existingCoupon) {
                throw new BadRequestException('Coupon code already exists');
            }
        }

        // Update fields
        if (updateCouponDto.code !== undefined) {
            coupon.code = updateCouponDto.code.toUpperCase();
        }
        if (updateCouponDto.description !== undefined) {
            coupon.description = updateCouponDto.description ?? null;
        }
        if (updateCouponDto.type !== undefined) {
            coupon.type = updateCouponDto.type;
        }
        if (updateCouponDto.value !== undefined) {
            coupon.value = updateCouponDto.value;
        }
        if (updateCouponDto.min_order_amount !== undefined) {
            coupon.min_order_amount = updateCouponDto.min_order_amount ?? null;
        }
        if (updateCouponDto.max_discount_amount !== undefined) {
            coupon.max_discount_amount = updateCouponDto.max_discount_amount ?? null;
        }
        if (updateCouponDto.usage_limit !== undefined) {
            coupon.usage_limit = updateCouponDto.usage_limit;
        }
        if (updateCouponDto.per_user_limit !== undefined) {
            coupon.per_user_limit = updateCouponDto.per_user_limit;
        }
        if (updateCouponDto.start_date !== undefined) {
            coupon.start_date = updateCouponDto.start_date ? new Date(updateCouponDto.start_date) : null;
        }
        if (updateCouponDto.end_date !== undefined) {
            coupon.end_date = updateCouponDto.end_date ? new Date(updateCouponDto.end_date) : null;
        }
        if (updateCouponDto.is_active !== undefined) {
            coupon.is_active = updateCouponDto.is_active;
        }
        if (updateCouponDto.applicable_products !== undefined) {
            coupon.applicable_products = updateCouponDto.applicable_products;
        }
        if (updateCouponDto.applicable_product_ids !== undefined) {
            coupon.applicable_product_ids = updateCouponDto.applicable_product_ids;
        }
        if (updateCouponDto.applicable_categories !== undefined) {
            coupon.applicable_categories = updateCouponDto.applicable_categories;
        }
        if (updateCouponDto.excluded_products !== undefined) {
            coupon.excluded_products = updateCouponDto.excluded_products;
        }

        const updatedCoupon = await this.couponRepository.save(coupon);
        return this.mapToResponse(updatedCoupon);
    }

    async remove(id: string): Promise<void> {
        const coupon = await this.couponRepository.findOne({ where: { id } });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        await this.couponRepository.remove(coupon);
    }

    async getActiveCoupons(): Promise<CouponListResponse[]> {
        const now = new Date();

        const coupons = await this.couponRepository
            .createQueryBuilder('coupon')
            .where('coupon.is_active = :isActive', { isActive: true })
            .andWhere(
                '(coupon.start_date IS NULL OR coupon.start_date <= :now)',
                { now },
            )
            .andWhere(
                '(coupon.end_date IS NULL OR coupon.end_date >= :now)',
                { now },
            )
            .andWhere(
                '(coupon.usage_limit = 0 OR coupon.usage_count < coupon.usage_limit)',
            )
            .orderBy('coupon.created_at', 'DESC')
            .getMany();

        return coupons.map((coupon) => this.mapToResponse(coupon));
    }

    async validateAndCalculate(
        code: string,
        cartTotal: number,
        productIds: string[],
        userId: number,
    ): Promise<CouponValidationResponse> {
        const coupon = await this.findByCode(code);

        if (!coupon) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: 'Invalid coupon code',
            };
        }

        // Check if coupon is active
        if (!coupon.is_active) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: 'This coupon is not active',
            };
        }

        // Check date validity
        const now = new Date();
        if (coupon.start_date && now < coupon.start_date) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: 'This coupon is not yet valid',
            };
        }
        if (coupon.end_date && now > coupon.end_date) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: 'This coupon has expired',
            };
        }

        // Check usage limit
        if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: 'This coupon has reached its usage limit',
            };
        }

        // Check per-user limit
        const userUsageCount = await this.couponUsageRepository.count({
            where: { coupon_id: coupon.id, user_id: userId },
        });
        if (userUsageCount >= coupon.per_user_limit) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: `You have already used this coupon ${coupon.per_user_limit} time(s)`,
            };
        }

        // Check minimum order amount
        if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: `Minimum order amount of ${coupon.min_order_amount} required`,
            };
        }

        // Check product applicability
        const hasExcludedProducts = productIds.some((id) =>
            coupon.excluded_products.includes(id),
        );
        if (hasExcludedProducts) {
            return {
                is_valid: false,
                discount_amount: 0,
                final_amount: cartTotal,
                message: 'Some products in your cart are excluded from this coupon',
            };
        }

        if (coupon.applicable_products === 'specific') {
            const hasApplicableProducts = productIds.some((id) =>
                coupon.applicable_product_ids.includes(id),
            );
            if (!hasApplicableProducts) {
                return {
                    is_valid: false,
                    discount_amount: 0,
                    final_amount: cartTotal,
                    message: 'This coupon is not applicable to the products in your cart',
                };
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (cartTotal * Number(coupon.value)) / 100;
            // Apply max discount cap if set
            if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
                discountAmount = Number(coupon.max_discount_amount);
            }
        } else {
            // fixed_amount
            discountAmount = Number(coupon.value);
            // Ensure discount doesn't exceed cart total
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal;
            }
        }

        // Round to 2 decimal places
        discountAmount = Math.round(discountAmount * 100) / 100;
        const finalAmount = Math.round((cartTotal - discountAmount) * 100) / 100;

        return {
            is_valid: true,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            message: 'Coupon applied successfully',
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: Number(coupon.value),
            },
        };
    }

    async incrementUsage(code: string): Promise<void> {
        const coupon = await this.findByCode(code);

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        coupon.usage_count += 1;
        await this.couponRepository.save(coupon);
    }

    async recordUsage(
        code: string,
        userId: number,
        orderId: string,
        discountAmount: number,
    ): Promise<CouponUsage> {
        const coupon = await this.findByCode(code);

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        const usage = new CouponUsage();
        usage.coupon_id = coupon.id;
        usage.user_id = userId;
        usage.order_id = orderId;
        usage.discount_amount = discountAmount;

        return this.couponUsageRepository.save(usage);
    }

    async getUserCouponUsage(userId: number, couponId: string): Promise<number> {
        return this.couponUsageRepository.count({
            where: { user_id: userId, coupon_id: couponId },
        });
    }

    private mapToResponse(coupon: Coupon): CouponListResponse {
        return {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: Number(coupon.value),
            min_order_amount: coupon.min_order_amount ? Number(coupon.min_order_amount) : null,
            max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
            usage_limit: coupon.usage_limit,
            usage_count: coupon.usage_count,
            per_user_limit: coupon.per_user_limit,
            start_date: coupon.start_date,
            end_date: coupon.end_date,
            is_active: coupon.is_active,
            applicable_products: coupon.applicable_products,
            applicable_product_ids: coupon.applicable_product_ids,
            applicable_categories: coupon.applicable_categories,
            excluded_products: coupon.excluded_products,
            created_at: coupon.created_at,
            updated_at: coupon.updated_at,
        };
    }
}
