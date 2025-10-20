/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  it('creates a pending transaction and initializes paystack', async () => {
    const brandModel: any = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'b1',
          products: [{ _id: 'p1', price: { min: 1000 } }],
        }),
      }),
    };
    const txModel: any = {
      create: jest.fn().mockResolvedValue({ _id: 't1' }),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    const paystack: any = {
      initializePayment: jest
        .fn()
        .mockResolvedValue({ authorization_url: 'u', reference: 'r' }),
    };

    const service = new TransactionsService(txModel, brandModel, paystack);
    const res = await service.createPurchase({
      cardId: 'b1',
      productId: 'p1',
      quantity: 1,
      customer: { email: 'e@e.com', name: 'n' },
    } as any);
    expect(res.transactionId).toBe('t1');
    expect(res.paystack.reference).toBe('r');
  });
});
