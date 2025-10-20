import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../cards/schemas/catalog.schema';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {
    this.apiUrl = this.config.get<string>('THIRD_PARTY_API_URL') || '';
    this.apiKey = this.config.get<string>('THIRD_PARTY_API_KEY') || '';
  }

  @Cron(process.env.SYNC_CRON || CronExpression.EVERY_HOUR)
  async sync() {
    if (!this.apiUrl) return;
    this.logger.log('Starting third-party catalog sync...');
    const res = await axios.get(this.apiUrl, {
      headers: { 'x-api-key': this.apiKey },
    });
    const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
    for (const item of items) {
      await this.brandModel.updateOne(
        { internalId: item.internalId },
        {
          $set: {
            name: item.name,
            countryCode: item.countryCode,
            currencyCode: item.currencyCode,
            description: item.description,
            disclaimer: item.disclaimer,
            redemptionInstructions: item.redemptionInstructions,
            terms: item.terms,
            logoUrl: item.logoUrl,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            modifiedDate: new Date(item.modifiedDate || Date.now()),
            products: item.products || [],
            categories: item.categories || [],
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`Sync completed; upserted ${items.length} items.`);
  }
}
