import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Put,
    Delete,
    UseGuards,
    UsePipes,
    ParseIntPipe,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, createCouponSchema } from './dto/create-coupon.dto';
import { UpdateCouponDto, updateCouponSchema } from './dto/update-coupon.dto';
import { ValidateCouponDto, validateCouponSchema } from './dto/validate-coupon.dto';
import { ApplyCouponDto, applyCouponSchema } from './dto/apply-coupon.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import { CouponValidationResponse, CouponListResponse } from './dto/coupon-response.dto';

@Controller('v1/coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    /**
     * Create a new coupon (Admin only)
     */
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UsePipes(new ZodValidationPipe(createCouponSchema))
    async create(@Body() createCouponDto: CreateCouponDto): Promise<CouponListResponse> {
        const coupon = await this.couponsService.create(createCouponDto);
        return this.mapToResponse(coupon);
    }

    /**
     * List all coupons with pagination and filters (Admin only)
     */
    @Get()
    @UseGuards(JwtAuthGuard, AdminGuard)
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('is_active') isActive?: string,
        @Query('type') type?: 'percentage' | 'fixed_amount',
    ): Promise<{ coupons: CouponListResponse[]; total: number; page: number; limit: number }> {
        const filters = {
            ...(isActive !== undefined && { is_active: isActive === 'true' }),
            ...(type && { type }),
            ...(search && { search }),
        };

        const pagination = {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
        };

        const result = await this.couponsService.findAll(filters, pagination);

        return {
            coupons: result.coupons.map((coupon) => this.mapToResponse(coupon)),
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }

    /**
     * List active coupons for customers
     */
    @Get('active')
    async getActiveCoupons(): Promise<CouponListResponse[]> {
        const coupons = await this.couponsService.getActiveCoupons();
        return coupons.map((coupon) => this.mapToResponse(coupon));
    }

    /**
     * Get coupon details by ID (Admin only)
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CouponListResponse> {
        const coupon = await this.couponsService.findOne(id);
        return this.mapToResponse(coupon);
    }

    /**
     * Update a coupon (Admin only)
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UsePipes(new ZodValidationPipe(updateCouponSchema))
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCouponDto: UpdateCouponDto,
    ): Promise<CouponListResponse> {
        const coupon = await this.couponsService.update(id, updateCouponDto);
        return this.mapToResponse(coupon);
    }

    /**
     * Delete a coupon (Admin only)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        await this.couponsService.remove(id);
        return { message: 'Coupon deleted successfully' };
    }

    /**
     * Validate a coupon for a cart
     */
    @Post('validate')
    @UsePipes(new ZodValidationPipe(validateCouponSchema))
    async validateCoupon(
        @Body() validateCouponDto: ValidateCouponDto,
    ): Promise<CouponValidationResponse> {
        return this.couponsService.validateAndCalculate(
            validateCouponDto.code,
            validateCouponDto.cart_total,
            validateCouponDto.product_ids,
            validateCouponDto.user_id,
        );
    }

    /**
     * Apply a coupon to an order (records usage)
     */
    @Post('apply')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ZodValidationPipe(applyCouponSchema))
    async applyCoupon(
        @Body() applyCouponDto: ApplyCouponDto,
    ): Promise<CouponValidationResponse & { order_id: string }> {
        // First validate the coupon
        const validation = await this.couponsService.validateAndCalculate(
            applyCouponDto.code,
            applyCouponDto.cart_total,
            applyCouponDto.product_ids,
            applyCouponDto.user_id,
        );

        if (!validation.is_valid) {
            return {
                ...validation,
                order_id: applyCouponDto.order_id,
            };
        }

        // Record the usage
        await this.couponsService.recordUsage(
            applyCouponDto.code,
            applyCouponDto.user_id,
            applyCouponDto.order_id,
            validation.discount_amount,
        );

        // Increment usage count
        await this.couponsService.incrementUsage(applyCouponDto.code);

        return {
            ...validation,
            order_id: applyCouponDto.order_id,
        };
    }

    private mapToResponse(coupon: CouponListResponse): CouponListResponse {
        return {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            min_order_amount: coupon.min_order_amount,
            max_discount_amount: coupon.max_discount_amount,
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
