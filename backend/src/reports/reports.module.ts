import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Product } from '../products/entities/product.entity';
import { Batch } from '../products/entities/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Batch,
      // Future entities to be added:
      // Order,
      // OrderItem,
      // User,
      // Payment,
      // Refund,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
