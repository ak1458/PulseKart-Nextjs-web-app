import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsObject,
    IsArray,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
    @IsNumber()
    productId: number;

    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsObject()
    attributes?: Record<string, any>;

    @IsOptional()
    @IsString()
    image?: string;
}

export class CreateOrderDto {
    @IsOptional()
    @IsNumber()
    userId?: number;

    @IsOptional()
    @IsString()
    guestEmail?: string;

    @IsOptional()
    @IsString()
    guestName?: string;

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @IsNumber()
    @Min(0)
    totalAmount: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    subtotalAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    taxAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    shippingAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsOptional()
    @IsObject()
    shippingAddress?: Record<string, any>;

    @IsOptional()
    @IsObject()
    billingAddress?: Record<string, any>;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}
