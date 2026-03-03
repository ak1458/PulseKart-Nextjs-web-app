import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController, AdminPaymentsController } from './payments.controller';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGatewayDiscount } from './entities/payment-gateway-discount.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PaymentMethod,
            PaymentGatewayDiscount,
            PaymentTransaction,
        ]),
    ],
    controllers: [PaymentsController, AdminPaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
