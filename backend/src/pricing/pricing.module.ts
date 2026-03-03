import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PricingRule } from './entities/pricing-rule.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PricingRule]),
        AuthModule, // For JWT authentication
    ],
    controllers: [PricingController],
    providers: [PricingService],
    exports: [PricingService],
})
export class PricingModule {}
