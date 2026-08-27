import {
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    IsIn,
    IsUUID,
    IsObject,
    Min,
    Max,
    ValidateNested,
    ArrayMaxSize,
    ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PAYMENT_METHODS } from '../order-pricing';
import type { PaymentMethod } from '../order-pricing';

/**
 * A requested line item.
 *
 * Deliberately carries no price. The catalogue is the only source of unit
 * prices; accepting one here is what would make price tampering possible.
 */
export class CheckoutItemDto {
    @IsInt()
    @Min(1)
    productId: number;

    @IsInt()
    @Min(1)
    @Max(100)
    quantity: number;
}

export class CheckoutDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items: CheckoutItemDto[];

    @IsIn(PAYMENT_METHODS as unknown as string[])
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    couponCode?: string;

    /** Required when any line item is prescription-only. */
    @IsOptional()
    @IsUUID()
    prescriptionId?: string;

    @IsOptional()
    @IsObject()
    shippingAddress?: Record<string, unknown>;

    @IsOptional()
    @IsString()
    notes?: string;
}

/** A quote needs only what affects the price. */
export class QuoteDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items: CheckoutItemDto[];

    @IsIn(PAYMENT_METHODS as unknown as string[])
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    couponCode?: string;
}
