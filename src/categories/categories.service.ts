import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { Brand, BrandDocument } from '../cards/schemas/catalog.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}

  async extractFromBrandsAndUpsert(): Promise<{ upserted: number; total: number }> {
    const pipeline = [
      { $unwind: '$categories' },
      {
        $group: {
          _id: { id: '$categories.id', name: '$categories.name' },
          description: { $first: '$categories.description' },
          brandCount: { $sum: 1 },
        },
      },
    ];
    const rows: Array<{
      _id: { id?: number; name: string };
      description?: string;
      brandCount: number;
    }> = await this.brandModel.aggregate(pipeline);

    const ops = rows.map((r) => ({
      updateOne: {
        filter: { id: r._id.id ?? null, name: r._id.name },
        update: {
          $set: {
            id: r._id.id ?? null,
            name: r._id.name,
            description: r.description ?? null,
            brandCount: r.brandCount,
          },
        },
        upsert: true,
      },
    }));
    if (ops.length) await this.categoryModel.bulkWrite(ops as any, { ordered: false });
    return { upserted: ops.length, total: rows.length };
  }

  async query(dto: QueryCategoriesDto) {
    const { page = 1, limit = 20, q } = dto;
    const filter: any = {};
    if (q) filter.$text = { $search: q };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.categoryModel.find(filter).skip(skip).limit(limit).lean(),
      this.categoryModel.countDocuments(filter),
    ]);
    return { page, limit, total, items };
  }

  getById(id: string) {
    return this.categoryModel.findById(id).lean();
  }
}

