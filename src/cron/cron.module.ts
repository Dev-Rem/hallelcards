import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SyncService } from './sync.service';
import { FxUpdaterService } from './fx-updater.service';
import { Brand, BrandSchema } from '../cards/schemas/catalog.schema';
import { CardsModule } from '../cards/cards.module';
import { AdminFxController } from './admin-fx.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    CardsModule,
  ],
  controllers: [AdminFxController],
  providers: [SyncService, FxUpdaterService],
})
export class CronModule {}


