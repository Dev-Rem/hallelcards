/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { CardsService } from './cards.service';
import { QueryCardsDto } from './dto/query-cards.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, BrandDocument } from './schemas/catalog.schema';
import { Model } from 'mongoose';
import axios from 'axios';
import {
  UsdConversion,
  UsdConversionDocument,
} from './schemas/usd-conversion.schema';

@Injectable()
export class AdminCardsService {
  private static syncRunning = false; // 🔑 in-memory lock

  constructor(
    private readonly cardsService: CardsService,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    @InjectModel(UsdConversion.name)
    private readonly usdConversionModel: Model<UsdConversionDocument>,
  ) {}

  // --- Queries ---
  getAll(dto: QueryCardsDto) {
    return this.cardsService.queryBrands(dto, false);
  }

  getById(id: string) {
    return this.cardsService.findById(id, false);
  }

  async updateConverted(id: string, converted: any) {
    return this.brandModel.findByIdAndUpdate(
      id,
      { $set: { 'products.$[].converted': converted } },
      { new: true },
    );
  }

  async updateBrandMarkup(id: string, markupPercentage: number) {
    return this.brandModel.findByIdAndUpdate(
      id,
      { $set: { markupOverride: markupPercentage } },
      { new: true },
    );
  }

  async updateProductMarkup(
    id: string,
    productId: string,
    markupPercentage: number,
  ) {
    return this.brandModel.findOneAndUpdate(
      { _id: id, 'products.id': Number(productId) },
      { $set: { 'products.$.markupOverride': markupPercentage } },
      { new: true },
    );
  }

  // --- Sync without Redis ---
  async syncFromProviderAndConvert(): Promise<{
    processed: number;
    errors: number;
    duration: number;
  }> {
    if (AdminCardsService.syncRunning) {
      throw new Error('Sync already running');
    }

    AdminCardsService.syncRunning = true;
    const start = Date.now();

    try {
      const API_URL = process.env.THIRD_PARTY_API_URL;
      const API_KEY = process.env.THIRD_PARTY_API_KEY;
      const url = `${API_URL.replace(/\/$/, '')}/getProducts`;

      const { data } = await axios.get(url, {
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      });

      const records: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];

      const usdMap = await this.loadUsdConversionMap();
      const ngnRounded = await this.fetchRoundedNgnRate();

      const batchSize = Number(process.env.GIFTCARD_BATCH_SIZE) || 200;
      let processed = 0;
      let errors = 0;
      const providerIds = new Set<string>();

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const displayOps = batch
          .map((rec) => {
            try {
              if (rec?.internalId) providerIds.add(String(rec.internalId));
              const products = Array.isArray(rec.products)
                ? rec.products.map((p: any) =>
                    this.convertProduct(
                      p,
                      rec.currencyCode,
                      usdMap,
                      ngnRounded,
                    ),
                  )
                : [];

              const doc = {
                internalId: rec.internalId,
                name: rec.name,
                countryCode: rec.countryCode,
                currencyCode: rec.currencyCode,
                description: rec.description,
                disclaimer: rec.disclaimer,
                redemptionInstructions: rec.redemptionInstructions,
                terms: rec.terms,
                logoUrl: rec.logoUrl,
                modifiedDate: rec.modifiedDate
                  ? new Date(rec.modifiedDate)
                  : new Date(),
                products,
                categories: Array.isArray(rec.categories) ? rec.categories : [],
              };

              processed += 1;
              return {
                updateOne: {
                  filter: { internalId: doc.internalId },
                  update: { $set: doc },
                  upsert: true,
                },
              };
            } catch {
              errors += 1;
              return null as any;
            }
          })
          .filter(Boolean);

        if (displayOps.length) {
          await this.brandModel.bulkWrite(displayOps as any, {
            ordered: false,
          });
        }
      }

      // Delete brands that no longer exist in provider
      if (providerIds.size > 0) {
        await this.brandModel.deleteMany({
          internalId: { $nin: Array.from(providerIds) },
        });
      }

      const duration = Date.now() - start;
      return { processed, errors, duration };
    } finally {
      AdminCardsService.syncRunning = false;
    }
  }

  // --- Helpers ---
  private convertProduct(
    p: any,
    parentCurrency: string,
    usdMap: Record<string, number>,
    ngnRounded: number,
  ) {
    const price = p?.price || {};
    const currency = (
      price.currencyCode ||
      parentCurrency ||
      'USD'
    ).toUpperCase();
    const usdRate = usdMap[currency] ?? 1;

    const minUsd = Math.round((price.min || 0) * usdRate * 100) / 100;
    const maxUsd = Math.round((price.max || 0) * usdRate * 100) / 100;
    const minNgn = Math.round(minUsd * ngnRounded);
    const maxNgn = Math.round(maxUsd * ngnRounded);

    return {
      ...p,
      converted: { minUsd, maxUsd, minNgn, maxNgn },
    };
  }

  private async loadUsdConversionMap(): Promise<Record<string, number>> {
    let docs = await this.usdConversionModel.find().lean();
    if (!docs || docs.length === 0) {
      await this.fetchAndStoreUsdRates();
      docs = await this.usdConversionModel.find().lean();
    }
    const map: Record<string, number> = {};
    for (const d of docs) {
      map[(d.currencyCode || '').toUpperCase()] = d.value || 1;
    }
    if (!map['USD']) map['USD'] = 1;
    return map;
  }

  private async fetchRoundedNgnRate(): Promise<number> {
    const OXR_URL = process.env.OPENEXCHANGERATES_API_URL;
    const OXR_KEY = process.env.OPENEXCHANGERATES_APP_ID;
    const { data } = await axios.get(`${OXR_URL}?app_id=${OXR_KEY}`);
    const ngn = data?.rates?.NGN;
    if (!ngn || typeof ngn !== 'number') {
      throw new Error('Failed to fetch NGN rate');
    }
    return Math.ceil(ngn / 1000) * 1000;
  }

  private async fetchAndStoreUsdRates(): Promise<void> {
    const OXR_URL = process.env.OPENEXCHANGERATES_API_URL;
    const OXR_KEY = process.env.OPENEXCHANGERATES_APP_ID;
    const { data } = await axios.get(`${OXR_URL}?app_id=${OXR_KEY}`);
    const rates = data?.rates || {};
    const ops: Array<{
      updateOne: {
        filter: { currencyCode: string };
        update: {
          $set: { currencyCode: string; value: number; dateModified: Date };
        };
        upsert: true;
      };
    }> = [];
    for (const cur of Object.keys(rates)) {
      const ratePerUsd = rates[cur];
      if (!ratePerUsd || typeof ratePerUsd !== 'number') continue;
      const toUsd = cur.toUpperCase() === 'USD' ? 1 : 1 / ratePerUsd;
      ops.push({
        updateOne: {
          filter: { currencyCode: cur.toUpperCase() },
          update: {
            $set: {
              currencyCode: cur.toUpperCase(),
              value: toUsd,
              dateModified: new Date(),
            },
          },
          upsert: true,
        },
      });
    }
    if (ops.length)
      await this.usdConversionModel.bulkWrite(ops as any, { ordered: false });
  }
}
