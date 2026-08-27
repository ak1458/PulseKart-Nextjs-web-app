import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { CheckoutService } from './checkout.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Batch } from '../products/entities/batch.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, Product, Batch]),
        CouponsModule,
        PrescriptionsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, CheckoutService],
    exports: [OrdersService, CheckoutService],
})
export class OrdersModule { }
