/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DiscountsService } from './discounts.service';
import { DiscountType } from './schemas/discount.schema';

describe('DiscountsService', () => {
  const makeService = () => {
    const discountModel: any = {
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };
    const service = new DiscountsService(discountModel);
    return { service, discountModel };
  };

  it('creates, lists, updates, deletes a discount', async () => {
    const { service, discountModel } = makeService();
    discountModel.create.mockResolvedValue({ _id: 'd1' });
    expect(
      await service.create({
        code: 'SAVE',
        type: DiscountType.PERCENT,
        value: 10,
      }),
    ).toEqual({ _id: 'd1' });

    discountModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'd1' }]),
    });
    expect(await service.list()).toEqual([{ _id: 'd1' }]);

    discountModel.findByIdAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'd1', value: 20 }),
    });
    expect(await service.update('d1', { value: 20 })).toEqual({
      _id: 'd1',
      value: 20,
    });

    discountModel.deleteOne.mockResolvedValue({});
    expect(await service.delete('d1')).toEqual({ deleted: true });
  });

  it('validates code constraints and computes amounts', async () => {
    const { service, discountModel } = makeService();
    const active = {
      code: 'SAVE',
      active: true,
      startsAt: undefined,
      endsAt: undefined,
      maxUses: undefined,
      usedCount: 0,
      minOrderAmount: 100,
      type: DiscountType.PERCENT,
      value: 10,
    };
    discountModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(active),
    });
    const res = await service.validateAndCompute('save', 1000);
    expect(res.discountAmount).toBe(100);
    expect(res.finalAmount).toBe(900);
  });

  it('increments usage', async () => {
    const { service, discountModel } = makeService();
    await service.incrementUse('d1');
    expect(discountModel.updateOne).toHaveBeenCalledWith(
      { _id: 'd1' },
      { $inc: { usedCount: 1 } },
    );
  });
});
