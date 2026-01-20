import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../cards/schemas/catalog.schema';
import { AdminCardsService } from '../cards/admin-cards.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    private readonly adminCards: AdminCardsService,
  ) {
    this.apiUrl = this.config.get<string>('THIRD_PARTY_API_URL') || '';
    this.apiKey = this.config.get<string>('THIRD_PARTY_API_KEY') || '';
  }

  @Cron(process.env.SYNC_CRON || CronExpression.EVERY_HOUR)
  async sync() {
    if (!this.apiUrl) return;
    this.logger.log('Starting unified catalog sync...');
    const { processed, errors, duration } =
      await this.adminCards.syncFromProviderAndConvert();
    this.logger.log(
      `Sync completed; processed=${processed} errors=${errors} in ${duration}ms`,
    );
  }
}
