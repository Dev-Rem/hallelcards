import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Brand, BrandDocument } from './schemas/catalog.schema';
import { QueryCardsDto } from './dto/query-cards.dto';

interface FacetResult<T> {
  items: T[];
  total: { count: number }[];
}

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  async queryBrands(dto: QueryCardsDto, excludePrice = false) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      priceCurrency = 'USD',
      currencyCode,
      countryCode,
      sortBy = 'name',
      sortDir = 'asc',
      inStock,
    } = dto;

    const match: PipelineStage.Match['$match'] = {};

    if (search) match['name'] = { $regex: search, $options: 'i' };
    if (category) match['categories.name'] = category;
    if (currencyCode) match['currencyCode'] = currencyCode.toUpperCase();
    if (countryCode) match['countryCode'] = countryCode.toUpperCase();
    if (typeof inStock === 'boolean')
      match['products.count'] = inStock ? { $gt: 0 } : 0;

    if (minPrice || maxPrice) {
      const priceField =
        priceCurrency === 'NGN'
          ? 'products.converted.minNgn'
          : 'products.converted.minUsd';
      match[priceField] = {} as any;
      if (minPrice) match[priceField].$gte = minPrice;
      if (maxPrice) match[priceField].$lte = maxPrice;
    }

    const sortStage: Record<string, 1 | -1> = {};
    if (sortBy === 'price') {
      sortStage[
        priceCurrency === 'NGN'
          ? 'products.converted.minNgn'
          : 'products.converted.minUsd'
      ] = sortDir === 'desc' ? -1 : 1;
    } else if (sortBy === 'modifiedDate') {
      sortStage['modifiedDate'] = sortDir === 'desc' ? -1 : 1;
    } else {
      sortStage['name'] = sortDir === 'desc' ? -1 : 1;
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: sortStage },
      {
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            excludePrice
              ? { $project: { 'products.price': 0 } }
              : { $project: {} },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [res] = (await this.brandModel
      .aggregate(pipeline)
      .exec()) as FacetResult<Brand>[];

    return {
      items: res.items,
      total: res.total[0]?.count || 0,
      page,
      limit,
    };
  }

  async findById(id: string, excludePrice = false) {
    const projection = excludePrice ? { 'products.price': 0 } : {};
    return this.brandModel.findById(id, projection).lean();
  }

  async getAllCategories(): Promise<
    { id: number; name: string; description?: string | null }[]
  > {
    const pipeline: PipelineStage[] = [
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories.id',
          name: { $first: '$categories.name' },
          description: { $first: '$categories.description' },
        },
      },
      { $project: { _id: 0, id: '$_id', name: 1, description: 1 } },
      { $sort: { name: 1 } }, // sort alphabetically
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.brandModel.aggregate(pipeline).exec();
  }
}
