/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import { AdminDiscountsController } from './admin-discounts.controller';
import { DiscountsService } from './discounts.service';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('AdminDiscountsController', () => {
  let controller: AdminDiscountsController;
  let discounts: DiscountsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminDiscountsController],
      providers: [
        {
          provide: DiscountsService,
          useValue: {
            list: jest.fn().mockResolvedValue([{ _id: 'd1' }]),
            create: jest.fn().mockResolvedValue({ _id: 'd1' }),
            update: jest.fn().mockResolvedValue({ _id: 'd1', value: 20 }),
            delete: jest.fn().mockResolvedValue({ deleted: true }),
          },
        },
      ],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AdminDiscountsController);
    discounts = moduleRef.get(DiscountsService);
  });

  it('lists discounts', async () => {
    const res = await controller.list();
    expect(res).toEqual([{ _id: 'd1' }]);
  });

  it('creates discount', async () => {
    const res = await controller.create({
      code: 'SAVE',
      type: 'PERCENT',
      value: 10,
    } as any);
    expect(res).toEqual({ _id: 'd1' });
  });

  it('updates discount', async () => {
    const res = await controller.update('d1', { value: 20 } as any);
    expect(res).toEqual({ _id: 'd1', value: 20 });
  });

  it('deletes discount', async () => {
    const res = await controller.remove('d1');
    expect(res).toEqual({ deleted: true });
  });
});
