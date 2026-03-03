import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Batch } from './products/entities/batch.entity';
import { Brand } from './products/entities/brand.entity';
import { Category } from './products/entities/category.entity';
import { Tag } from './products/entities/tag.entity';
import { Attribute } from './products/entities/attribute.entity';
import { ProductAttribute } from './products/entities/product-attribute.entity';
import { ProductVariation } from './products/entities/product-variation.entity';
import { FrequentlyBoughtTogether } from './products/entities/frequently-bought-together.entity';
import { SizeGuide } from './products/entities/size-guide.entity';
import { Review } from './products/entities/review.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CouponsModule } from './coupons/coupons.module';
import { Coupon } from './coupons/entities/coupon.entity';
import { CouponUsage } from './coupons/entities/coupon-usage.entity';
import { PricingModule } from './pricing/pricing.module';
import { PricingRule } from './pricing/entities/pricing-rule.entity';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentMethod } from './payments/entities/payment-method.entity';
import { PaymentGatewayDiscount } from './payments/entities/payment-gateway-discount.entity';
import { PaymentTransaction } from './payments/entities/payment-transaction.entity';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Rate limiting - 10 requests per 60 seconds per IP
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000, // 60 seconds
                    limit: 100,  // 100 requests
                },
            ],
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            ...(process.env.DATABASE_URL
                ? { url: process.env.DATABASE_URL }
                : {
                    host: process.env.POSTGRES_HOST || '127.0.0.1',
                    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
                    username: process.env.POSTGRES_USER || 'pulse_user',
                    password: process.env.POSTGRES_PASSWORD || 'pulse_password',
                    database: process.env.POSTGRES_DB || 'pulse_db',
                }),
            entities: [
                // Product entities
                Product,
                Batch,
                Brand,
                Category,
                Tag,
                Attribute,
                ProductAttribute,
                ProductVariation,
                FrequentlyBoughtTogether,
                SizeGuide,
                Review,
                // User entities
                User,
                // Coupon entities
                Coupon,
                CouponUsage,
                // Pricing entities
                PricingRule,
                // Payment entities
                PaymentMethod,
                PaymentGatewayDiscount,
                PaymentTransaction,
                // Order entities
                Order,
                OrderItem,
            ],
            synchronize: process.env.DB_SYNC === 'true', // Controlled by env var
            // Connection pooling
            extra: {
                max: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            },
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        }),
        ProductsModule,
        AuthModule,
        UsersModule,
        CouponsModule,
        PricingModule,
        ReportsModule,
        PaymentsModule,
        OrdersModule,
        DatabaseModule, // Seeds admin user on startup
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Apply rate limiting globally
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
