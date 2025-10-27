import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Brand, BrandSchema } from './schemas/catalog.schema';

import {
  UsdConversion,
  UsdConversionSchema,
} from './schemas/usd-conversion.schema';
import { AdminCardsController } from './admin-cards.controller';
import { AdminCardsService } from './admin-cards.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: UsdConversion.name, schema: UsdConversionSchema },
    ]),
  ],
  controllers: [CardsController, AdminCardsController],
  providers: [CardsService, AdminCardsService],
  exports: [CardsService, AdminCardsService],
})
export class CardsModule {}
