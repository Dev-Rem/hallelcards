import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  async getOrCreate(): Promise<Settings> {
    const existing = await this.settingsModel.findOne().lean();
    if (existing) return existing as any;
    return this.settingsModel.create({ globalMarkupPercentage: 3 });
  }

  async getGlobalMarkup(): Promise<number> {
    const s = await this.getOrCreate();
    return s.globalMarkupPercentage ?? 3;
  }

  async updateGlobalMarkup(percentage: number, updatedBy?: string) {
    const update: Partial<Settings> = {
      globalMarkupPercentage: percentage,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined,
    };
    return this.settingsModel.findOneAndUpdate({}, { $set: update }, {
      new: true,
      upsert: true,
    });
  }
}


