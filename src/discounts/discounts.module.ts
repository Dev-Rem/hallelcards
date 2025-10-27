import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Discount, DiscountSchema } from './schemas/discount.schema';
import { DiscountsService } from './discounts.service';
import { AdminDiscountsController } from './admin-discounts.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Discount.name, schema: DiscountSchema }])],
  controllers: [AdminDiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}


