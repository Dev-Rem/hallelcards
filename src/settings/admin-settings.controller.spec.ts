/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import { AdminSettingsController } from './admin-settings.controller';
import { SettingsService } from './settings.service';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('AdminSettingsController', () => {
  let controller: AdminSettingsController;
  let settings: SettingsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminSettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getGlobalMarkup: jest.fn().mockResolvedValue(3),
            updateGlobalMarkup: jest
              .fn()
              .mockResolvedValue({ globalMarkupPercentage: 5 }),
          },
        },
      ],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AdminSettingsController);
    settings = moduleRef.get(SettingsService);
  });

  it('gets markup', async () => {
    const res = await controller.getMarkup();
    expect(res).toEqual({ globalMarkupPercentage: 3 });
  });

  it('updates markup', async () => {
    const res = await controller.updateMarkup({ percentage: 5 } as any);
    expect(settings.updateGlobalMarkup).toHaveBeenCalledWith(5);
    expect(res).toEqual({ globalMarkupPercentage: 5 });
  });
});
