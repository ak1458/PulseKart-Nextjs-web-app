import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import {
    CalculatePriceDto,
    CalculateCartDto,
    ListPricingRulesDto,
} from './dto/calculate-price.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Simple admin guard - in production, use a proper roles guard
import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user?.role === 'admin';
    }
}

@Controller('v1')
export class PricingController {
    constructor(private readonly pricingService: PricingService) {}

    // ==================== Admin Routes ====================

    /**
     * Create a new pricing rule
     * POST /v1/pricing-rules
     */
    @Post('pricing-rules')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async createRule(@Body() createDto: CreatePricingRuleDto) {
        const rule = await this.pricingService.create(createDto);
        return {
            success: true,
            data: rule,
            message: 'Pricing rule created successfully',
        };
    }

    /**
     * List all pricing rules with filters
     * GET /v1/pricing-rules?isActive=true&type=percentage_discount&search=summer&limit=50&offset=0
     */
    @Get('pricing-rules')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async listRules(@Query() query: ListPricingRulesDto) {
        const { rules, total } = await this.pricingService.findAll({
            isActive: query.isActive,
            type: query.type,
            search: query.search,
            limit: query.limit,
            offset: query.offset,
        });

        return {
            success: true,
            data: rules,
            meta: {
                total,
                limit: query.limit,
                offset: query.offset,
            },
        };
    }

    /**
     * Get a single pricing rule by ID
     * GET /v1/pricing-rules/:id
     */
    @Get('pricing-rules/:id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getRule(@Param('id', ParseIntPipe) id: number) {
        const rule = await this.pricingService.findOne(id);
        return {
            success: true,
            data: rule,
        };
    }

    /**
     * Update a pricing rule
     * PUT /v1/pricing-rules/:id
     */
    @Put('pricing-rules/:id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateRule(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdatePricingRuleDto
    ) {
        const rule = await this.pricingService.update(id, updateDto);
        return {
            success: true,
            data: rule,
            message: 'Pricing rule updated successfully',
        };
    }

    /**
     * Delete a pricing rule
     * DELETE /v1/pricing-rules/:id
     */
    @Delete('pricing-rules/:id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async deleteRule(@Param('id', ParseIntPipe) id: number) {
        await this.pricingService.remove(id);
        return {
            success: true,
            message: 'Pricing rule deleted successfully',
        };
    }

    // ==================== Public/Customer Routes ====================

    /**
     * Calculate price for a single product
     * POST /v1/pricing/calculate
     *
     * Example request:
     * {
     *   "productId": 1,
     *   "quantity": 5,
     *   "userId": 123,
     *   "cartTotal": 2500,
     *   "userTags": ["vip", "loyal"]
     * }
     */
    @Post('pricing/calculate')
    @HttpCode(HttpStatus.OK)
    async calculatePrice(@Body() calculateDto: CalculatePriceDto) {
        // In a real implementation, fetch the product price from database
        // For now, this is a simplified version that assumes price is provided
        // or fetched by product service

        // Note: In production, you'd inject ProductsService to get the actual price
        // This is a placeholder - you'll need to integrate with your product service
        const basePrice = calculateDto['price'] as number || 0;

        if (!basePrice) {
            return {
                success: false,
                message: 'Product price not found. Please provide price in request or ensure product exists.',
            };
        }

        const result = await this.pricingService.calculatePrice(basePrice, {
            productId: calculateDto.productId,
            quantity: calculateDto.quantity,
            userId: calculateDto.userId,
            cartTotal: calculateDto.cartTotal,
            userTags: calculateDto.userTags,
        });

        return {
            success: true,
            data: result,
        };
    }

    /**
     * Calculate prices for an entire cart
     * POST /v1/pricing/calculate-cart
     *
     * Example request:
     * {
     *   "items": [
     *     { "productId": 1, "quantity": 5, "price": 100, "categoryId": "vitamins" },
     *     { "productId": 2, "quantity": 2, "price": 200, "categoryId": "supplements" }
     *   ],
     *   "userId": 123,
     *   "userTags": ["vip"]
     * }
     */
    @Post('pricing/calculate-cart')
    @HttpCode(HttpStatus.OK)
    async calculateCart(@Body() calculateDto: CalculateCartDto) {
        const result = await this.pricingService.calculateCartPrices(
            calculateDto.items,
            {
                userId: calculateDto.userId,
                userTags: calculateDto.userTags,
            }
        );

        return {
            success: true,
            data: result,
        };
    }

    /**
     * Get active rules for a specific product
     * GET /v1/pricing/rules-for-product/:productId
     */
    @Get('pricing/rules-for-product/:productId')
    async getRulesForProduct(
        @Param('productId', ParseIntPipe) productId: number
    ) {
        const rules = await this.pricingService.getActiveRulesForProduct(productId);
        return {
            success: true,
            data: rules,
        };
    }
}
