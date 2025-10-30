/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import { AdminFxController } from './admin-fx.controller';
import { FxUpdaterService } from './fx-updater.service';
import { getModelToken } from '@nestjs/mongoose';

describe('AdminFxController', () => {
  let controller: AdminFxController;
  let model: any;
  let fx: FxUpdaterService;

  beforeEach(async () => {
    model = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ currencyCode: 'USD', value: 1 }]),
      }),
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ currencyCode: 'USD', value: 1 }),
      }),
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValue({ currencyCode: 'NGN', value: 1500 }),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminFxController],
      providers: [
        { provide: getModelToken('UsdConversion'), useValue: model },
        {
          provide: FxUpdaterService,
          useValue: { updateRates: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    controller = moduleRef.get(AdminFxController);
    fx = moduleRef.get(FxUpdaterService);
  });

  it('lists, gets, updates and refreshes rates', async () => {
    expect(await controller.list()).toEqual([
      { currencyCode: 'USD', value: 1 },
    ]);
    expect(await controller.get('USD')).toEqual({
      currencyCode: 'USD',
      value: 1,
    });
    expect(await controller.update('NGN', { value: 1500 } as any)).toEqual({
      currencyCode: 'NGN',
      value: 1500,
    });
    expect(await controller.refresh()).toEqual({ refreshed: true });
    expect(fx.updateRates).toHaveBeenCalled();
  });
});
