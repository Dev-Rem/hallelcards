/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CardsService } from './cards.service';

function aggMock(output: any) {
  return {
    aggregate: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(output) }),
  } as any;
}

describe('CardsService', () => {
  it('builds pipeline with filters, sorting, pagination', async () => {
    const model: any = aggMock([
      { items: [{ name: 'A' }], total: [{ count: 1 }] },
    ]);
    const service = new CardsService(model);
    const res = await service.queryBrands({
      page: 2,
      limit: 5,
      search: 'gift',
      category: 'Gaming',
      minPrice: 10,
      maxPrice: 50,
      priceCurrency: 'USD',
      currencyCode: 'USD',
      countryCode: 'US',
      sortBy: 'price',
      sortDir: 'desc',
      inStock: true,
    } as any);
    expect(res).toEqual({
      items: [{ name: 'A' }],
      total: 1,
      page: 2,
      limit: 5,
    });
  });

  it('getAllCategories returns aggregated categories', async () => {
    const model: any = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ id: 1, name: 'X' }]),
      }),
    };
    const service = new CardsService(model);
    const cats = await service.getAllCategories();
    expect(cats).toEqual([{ id: 1, name: 'X' }]);
  });
});
