import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, And } from 'typeorm';
import {
    PricingRule,
    PricingRuleConditions,
    PricingRuleActions,
    PricingRuleType,
    TieredPricingTier,
} from './entities/pricing-rule.entity';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';

export interface PriceCalculationContext {
    productId: number;
    quantity: number;
    categoryId?: string;
    userId?: number;
    cartTotal?: number;
    userTags?: string[];
}

export interface PriceCalculationResult {
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    discountPercent: number;
    appliedRules: AppliedRule[];
    breakdown: PriceBreakdownItem[];
}

export interface AppliedRule {
    ruleId: number;
    ruleName: string;
    type: PricingRuleType;
    discountAmount: number;
    description: string;
}

export interface PriceBreakdownItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface CartItemResult {
    productId: number;
    quantity: number;
    originalTotal: number;
    finalTotal: number;
    discountAmount: number;
    appliedRules: AppliedRule[];
}

export interface CartCalculationResult {
    items: CartItemResult[];
    originalTotal: number;
    finalTotal: number;
    totalDiscount: number;
    appliedRules: AppliedRule[];
}

@Injectable()
export class PricingService {
    constructor(
        @InjectRepository(PricingRule)
        private pricingRuleRepository: Repository<PricingRule>
    ) {}

    // ==================== CRUD Operations ====================

    async create(createDto: CreatePricingRuleDto): Promise<PricingRule> {
        const rule = this.pricingRuleRepository.create({
            name: createDto.name,
            description: createDto.description,
            type: createDto.type,
            priority: createDto.priority,
            isActive: createDto.isActive,
            startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
            endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
            conditions: createDto.conditions,
            actions: createDto.actions,
            stackable: createDto.stackable,
        });
        return this.pricingRuleRepository.save(rule);
    }

    async findAll(
        filters: {
            isActive?: boolean;
            type?: PricingRuleType;
            search?: string;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<{ rules: PricingRule[]; total: number }> {
        const { isActive, type, search, limit = 50, offset = 0 } = filters;

        const queryBuilder = this.pricingRuleRepository.createQueryBuilder('rule');

        if (isActive !== undefined) {
            queryBuilder.andWhere('rule.isActive = :isActive', { isActive });
        }

        if (type) {
            queryBuilder.andWhere('rule.type = :type', { type });
        }

        if (search) {
            queryBuilder.andWhere(
                '(LOWER(rule.name) LIKE LOWER(:search) OR LOWER(rule.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        const [rules, total] = await queryBuilder
            .orderBy('rule.priority', 'DESC')
            .addOrderBy('rule.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return { rules, total };
    }

    async findOne(id: number): Promise<PricingRule> {
        const rule = await this.pricingRuleRepository.findOne({ where: { id } });
        if (!rule) {
            throw new NotFoundException(`Pricing rule with ID ${id} not found`);
        }
        return rule;
    }

    async update(id: number, updateDto: UpdatePricingRuleDto): Promise<PricingRule> {
        const rule = await this.findOne(id);

        // Update fields
        if (updateDto.name !== undefined) rule.name = updateDto.name;
        if (updateDto.description !== undefined) rule.description = updateDto.description;
        if (updateDto.type !== undefined) rule.type = updateDto.type;
        if (updateDto.priority !== undefined) rule.priority = updateDto.priority;
        if (updateDto.isActive !== undefined) rule.isActive = updateDto.isActive;
        if (updateDto.startDate !== undefined) {
            rule.startDate = updateDto.startDate ? new Date(updateDto.startDate) : null;
        }
        if (updateDto.endDate !== undefined) {
            rule.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
        }
        if (updateDto.conditions !== undefined) rule.conditions = updateDto.conditions;
        if (updateDto.actions !== undefined) rule.actions = updateDto.actions;
        if (updateDto.stackable !== undefined) rule.stackable = updateDto.stackable;

        return this.pricingRuleRepository.save(rule);
    }

    async remove(id: number): Promise<void> {
        const rule = await this.findOne(id);
        await this.pricingRuleRepository.remove(rule);
    }

    // ==================== Price Calculation ====================

    async calculatePrice(
        basePrice: number,
        context: PriceCalculationContext
    ): Promise<PriceCalculationResult> {
        const { productId, quantity } = context;
        const applicableRules = await this.getApplicableRules(context);

        let currentPrice = basePrice * quantity;
        let totalDiscount = 0;
        const appliedRules: AppliedRule[] = [];
        const breakdown: PriceBreakdownItem[] = [];

        // Separate stackable and non-stackable rules
        const nonStackableRules = applicableRules.filter((r) => !r.stackable);
        const stackableRules = applicableRules.filter((r) => r.stackable);

        // Apply the highest priority non-stackable rule (if any)
        if (nonStackableRules.length > 0) {
            const bestNonStackable = nonStackableRules[0]; // Already sorted by priority
            const result = this.applyRule(bestNonStackable, basePrice, quantity);
            
            if (result.discount > 0) {
                totalDiscount += result.discount;
                appliedRules.push({
                    ruleId: bestNonStackable.id,
                    ruleName: bestNonStackable.name,
                    type: bestNonStackable.type,
                    discountAmount: result.discount,
                    description: result.description,
                });
                
                // Add breakdown items
                breakdown.push(...result.breakdown);
            }
        }

        // Apply all stackable rules
        for (const rule of stackableRules) {
            const result = this.applyRule(rule, basePrice, quantity);
            
            if (result.discount > 0) {
                totalDiscount += result.discount;
                appliedRules.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    type: rule.type,
                    discountAmount: result.discount,
                    description: result.description,
                });
            }
        }

        // If no non-stackable rule was applied, use original price for breakdown
        if (nonStackableRules.length === 0 && breakdown.length === 0) {
            breakdown.push({
                description: 'Regular price',
                quantity,
                unitPrice: basePrice,
                total: basePrice * quantity,
            });
        }

        const finalPrice = Math.max(0, currentPrice - totalDiscount);

        return {
            originalPrice: basePrice * quantity,
            finalPrice,
            discountAmount: totalDiscount,
            discountPercent:
                currentPrice > 0 ? (totalDiscount / currentPrice) * 100 : 0,
            appliedRules,
            breakdown,
        };
    }

    async calculateCartPrices(
        items: Array<{
            productId: number;
            quantity: number;
            price: number;
            categoryId?: string;
        }>,
        context: Omit<PriceCalculationContext, 'productId' | 'quantity' | 'categoryId'>
    ): Promise<CartCalculationResult> {
        const itemResults: CartItemResult[] = [];
        const allAppliedRules: Map<number, AppliedRule> = new Map();
        let originalTotal = 0;
        let finalTotal = 0;

        for (const item of items) {
            const itemContext: PriceCalculationContext = {
                ...context,
                productId: item.productId,
                quantity: item.quantity,
                categoryId: item.categoryId,
            };

            const result = await this.calculatePrice(item.price, itemContext);

            itemResults.push({
                productId: item.productId,
                quantity: item.quantity,
                originalTotal: result.originalPrice,
                finalTotal: result.finalPrice,
                discountAmount: result.discountAmount,
                appliedRules: result.appliedRules,
            });

            originalTotal += result.originalPrice;
            finalTotal += result.finalPrice;

            // Collect unique applied rules
            for (const rule of result.appliedRules) {
                if (!allAppliedRules.has(rule.ruleId)) {
                    allAppliedRules.set(rule.ruleId, rule);
                }
            }
        }

        return {
            items: itemResults,
            originalTotal,
            finalTotal,
            totalDiscount: originalTotal - finalTotal,
            appliedRules: Array.from(allAppliedRules.values()),
        };
    }

    async getApplicableRules(
        context: PriceCalculationContext
    ): Promise<PricingRule[]> {
        const now = new Date();

        // Get all active rules
        const allRules = await this.pricingRuleRepository.find({
            where: { isActive: true },
            order: { priority: 'DESC' },
        });

        // Filter rules that match conditions
        return allRules.filter((rule) => {
            // Check date range
            if (rule.startDate && now < rule.startDate) return false;
            if (rule.endDate && now > rule.endDate) return false;

            // Check other conditions
            return this.evaluateConditions(rule.conditions, context);
        });
    }

    evaluateConditions(
        conditions: PricingRuleConditions,
        context: PriceCalculationContext
    ): boolean {
        const { productId, quantity, categoryId, cartTotal, userTags } = context;

        // Check quantity constraints
        if (conditions.minQuantity !== undefined && quantity < conditions.minQuantity) {
            return false;
        }
        if (conditions.maxQuantity !== undefined && quantity > conditions.maxQuantity) {
            return false;
        }

        // Check order value constraints
        if (conditions.minOrderValue !== undefined) {
            const value = cartTotal ?? 0;
            if (value < conditions.minOrderValue) return false;
        }
        if (conditions.maxOrderValue !== undefined) {
            const value = cartTotal ?? 0;
            if (value > conditions.maxOrderValue) return false;
        }

        // Check product ID
        if (conditions.productIds !== undefined && conditions.productIds.length > 0) {
            if (!conditions.productIds.includes(productId)) return false;
        }

        // Check category ID
        if (conditions.categoryIds !== undefined && conditions.categoryIds.length > 0) {
            if (!categoryId || !conditions.categoryIds.includes(categoryId)) return false;
        }

        // Check user tags
        if (conditions.userTags !== undefined && conditions.userTags.length > 0) {
            if (!userTags || !conditions.userTags.some((tag) => userTags.includes(tag))) {
                return false;
            }
        }

        // Check time of day
        if (conditions.timeOfDay) {
            if (!this.isWithinTimeOfDay(conditions.timeOfDay)) return false;
        }

        // Check day of week
        if (conditions.dayOfWeek !== undefined && conditions.dayOfWeek.length > 0) {
            const currentDay = new Date().getDay();
            if (!conditions.dayOfWeek.includes(currentDay)) return false;
        }

        return true;
    }

    private isWithinTimeOfDay(timeRange: string): boolean {
        const [start, end] = timeRange.split('-');
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return currentTime >= startMinutes && currentTime <= endMinutes;
    }

    applyRule(
        rule: PricingRule,
        basePrice: number,
        quantity: number
    ): { discount: number; description: string; breakdown: PriceBreakdownItem[] } {
        const actions = rule.actions;
        const breakdown: PriceBreakdownItem[] = [];

        switch (rule.type) {
            case 'percentage_discount': {
                const percent = actions.discountPercent || 0;
                const discount = (basePrice * quantity * percent) / 100;
                breakdown.push({
                    description: `${rule.name} (${percent}% off)`,
                    quantity,
                    unitPrice: basePrice * (1 - percent / 100),
                    total: basePrice * quantity - discount,
                });
                return {
                    discount,
                    description: `${percent}% discount applied`,
                    breakdown,
                };
            }

            case 'fixed_discount': {
                const amount = actions.discountAmount || 0;
                const discount = Math.min(amount * quantity, basePrice * quantity);
                breakdown.push({
                    description: `${rule.name} (₹${amount} off per unit)`,
                    quantity,
                    unitPrice: basePrice - amount,
                    total: basePrice * quantity - discount,
                });
                return {
                    discount,
                    description: `₹${amount} fixed discount per unit applied`,
                    breakdown,
                };
            }

            case 'buy_x_get_y': {
                const buyQty = actions.buyQuantity || 1;
                const getQty = actions.getQuantity || 1;
                const sets = Math.floor(quantity / buyQty);
                const freeItems = sets * getQty;
                const discount = Math.min(freeItems * basePrice, basePrice * quantity);
                const paidItems = quantity - freeItems;

                if (sets > 0) {
                    breakdown.push({
                        description: `${rule.name} (Buy ${buyQty} Get ${getQty} Free)`,
                        quantity: paidItems,
                        unitPrice: basePrice,
                        total: paidItems * basePrice,
                    });
                }

                return {
                    discount,
                    description: `Buy ${buyQty} Get ${getQty} Free applied (${freeItems} free items)`,
                    breakdown,
                };
            }

            case 'bulk_price': {
                const bulkPrice = actions.bulkPrice || basePrice;
                const discount = (basePrice - bulkPrice) * quantity;
                breakdown.push({
                    description: `${rule.name} (Bulk price ₹${bulkPrice})`,
                    quantity,
                    unitPrice: bulkPrice,
                    total: bulkPrice * quantity,
                });
                return {
                    discount,
                    description: `Bulk price ₹${bulkPrice} applied`,
                    breakdown,
                };
            }

            case 'tiered_pricing': {
                const tiers = actions.tiers || [];
                // Sort tiers by minQty descending to find the applicable tier
                const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty);
                const applicableTier = sortedTiers.find((t) => quantity >= t.minQty);

                if (applicableTier) {
                    const tierPrice = applicableTier.price;
                    const discount = (basePrice - tierPrice) * quantity;
                    breakdown.push({
                        description: `${rule.name} (Tier: ${applicableTier.minQty}+ units at ₹${tierPrice})`,
                        quantity,
                        unitPrice: tierPrice,
                        total: tierPrice * quantity,
                    });
                    return {
                        discount,
                        description: `Tiered pricing: ${applicableTier.minQty}+ units at ₹${tierPrice}`,
                        breakdown,
                    };
                }

                return {
                    discount: 0,
                    description: 'No applicable tier found',
                    breakdown: [],
                };
            }

            default:
                return { discount: 0, description: 'Unknown rule type', breakdown: [] };
        }
    }

    // ==================== Helper Methods ====================

    async getActiveRulesForProduct(productId: number): Promise<PricingRule[]> {
        const now = new Date();
        const allRules = await this.pricingRuleRepository.find({
            where: { isActive: true },
        });

        return allRules.filter((rule) => {
            // Check date range
            if (rule.startDate && now < rule.startDate) return false;
            if (rule.endDate && now > rule.endDate) return false;

            // Check if rule applies to specific products
            if (rule.conditions.productIds?.length) {
                return rule.conditions.productIds.includes(productId);
            }

            return true;
        });
    }

    async validateRuleConditions(ruleId: number): Promise<boolean> {
        try {
            const rule = await this.findOne(ruleId);
            const now = new Date();

            // Check if rule is active and within date range
            if (!rule.isActive) return false;
            if (rule.startDate && now < rule.startDate) return false;
            if (rule.endDate && now > rule.endDate) return false;

            return true;
        } catch {
            return false;
        }
    }
}
