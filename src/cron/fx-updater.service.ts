import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsdConversion, UsdConversionDocument } from '../cards/schemas/usd-conversion.schema';

@Injectable()
export class FxUpdaterService {
  private readonly logger = new Logger(FxUpdaterService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(UsdConversion.name)
    private readonly usdModel: Model<UsdConversionDocument>,
  ) {}

  @Cron(process.env.OXR_CRON || CronExpression.EVERY_6_HOURS)
  async updateRates() {
    const OXR_URL = this.config.get<string>('OPENEXCHANGERATES_API_URL');
    const OXR_KEY = this.config.get<string>('OPENEXCHANGERATES_APP_ID');
    if (!OXR_URL || !OXR_KEY) {
      this.logger.warn('OXR config missing; skipping FX update');
      return;
    }
    try {
      const { data } = await axios.get(`${OXR_URL}?app_id=${OXR_KEY}`);
      const rates = data?.rates || {};
      const ops = Object.entries(rates).map(([code, value]) => ({
        updateOne: {
          filter: { currencyCode: String(code).toUpperCase() },
          update: {
            $set: {
              currencyCode: String(code).toUpperCase(),
              value: typeof value === 'number' ? value : 1,
              dateModified: new Date(),
            },
          },
          upsert: true,
        },
      }));
      if (ops.length) await this.usdModel.bulkWrite(ops as any, { ordered: false });
      this.logger.log(`FX update completed: updated ${ops.length} currencies`);
    } catch (e) {
      this.logger.error('FX update failed', e as any);
    }
  }
}


