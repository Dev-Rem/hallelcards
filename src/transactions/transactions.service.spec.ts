/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TransactionsService } from './transactions.service';
import { TransactionStatus } from './schemas/transaction.schema';

function chainableFindMock(items: any[]) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(items),
  };
}

describe('TransactionsService', () => {
  const makeService = () => {
    const brandModel: any = {
      findById: jest.fn(),
    };
    const txModel: any = {
      create: jest.fn(),
      updateOne: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
      find: jest.fn(),
    };
    const paystack: any = {
      initializePayment: jest.fn(),
      refund: jest.fn(),
    };
    const settings: any = { getGlobalMarkup: jest.fn().mockResolvedValue(3) };
    const discounts: any = {
      validateAndCompute: jest.fn(),
      incrementUse: jest.fn(),
    };
    const notifications: any = {
      purchaseInitiated: jest.fn(),
      purchaseSucceeded: jest.fn(),
      purchaseFailed: jest.fn(),
    };
    const service = new TransactionsService(
      txModel,
      brandModel,
      paystack,
      settings,
      discounts,
      notifications,
    );
    return {
      service,
      txModel,
      brandModel,
      paystack,
      settings,
      discounts,
      notifications,
    };
  };

  it('creates a pending guest transaction, applies global markup, initializes paystack, notifies admin', async () => {
    const { service, brandModel, txModel, paystack, notifications } =
      makeService();

    brandModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'b1',
        products: [{ id: 'p1', price: { min: 1000 } }],
      }),
    });
    txModel.create.mockResolvedValue({ _id: 't1' });
    paystack.initializePayment.mockResolvedValue({
      authorization_url: 'u',
      reference: 'r',
    });

    const res = await service.createPurchase({
      cardId: 'b1',
      productId: 'p1',
      quantity: 2,
      customer: { email: 'guest@example.com', name: 'Guest' },
    } as any);

    expect(txModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        card: expect.anything(),
        productId: 'p1',
        quantity: 2,
        unitPrice: 1000,
        markupApplied: 3,
        status: TransactionStatus.PENDING,
      }),
    );
    expect(paystack.initializePayment).toHaveBeenCalled();
    expect(txModel.updateOne).toHaveBeenCalledWith(
      { _id: 't1' },
      { $set: { paystackReference: 'r' } },
    );
    expect(notifications.purchaseInitiated).toHaveBeenCalled();
    expect(res).toEqual({
      transactionId: 't1',
      paystack: { authorization_url: 'u', reference: 'r' },
    });
  });

  it('applies product override and discount during pricing', async () => {
    const { service, brandModel, txModel, paystack, discounts } = makeService();
    brandModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'b1',
        products: [{ id: 'p1', price: { min: 1000 }, markupOverride: 10 }],
      }),
    });
    discounts.validateAndCompute.mockResolvedValue({
      discountAmount: 50,
      finalAmount: 1750,
    });
    txModel.create.mockResolvedValue({ _id: 't1' });
    paystack.initializePayment.mockResolvedValue({
      authorization_url: 'u',
      reference: 'r',
    });

    await service.createPurchase({
      cardId: 'b1',
      productId: 'p1',
      quantity: 2,
      discountCode: 'SAVE',
      customer: { email: 'e@e.com', name: 'n' },
    } as any);

    // 1000 unit -> 10% markup => 1100, qty 2 => 2200, discount applied to 1750 final
    expect(paystack.initializePayment).toHaveBeenCalledWith('e@e.com', 1750);
    expect(txModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ discountCode: 'SAVE', discountAmount: 50 }),
    );
  });

  it('markSuccessIfValidPaystack marks success and increments discount when verification matches', async () => {
    const { service, txModel, discounts, notifications } = makeService();
    txModel.findOne.mockResolvedValue({
      _id: 't1',
      totalAmount: 2000,
      currency: 'NGN',
      status: TransactionStatus.PENDING,
      discountCode: 'SAVE',
    });

    await service.markSuccessIfValidPaystack('ref-1', {
      amount: 200000, // kobo
      currency: 'NGN',
      status: 'success',
    });

    expect(txModel.updateOne).toHaveBeenCalledWith(
      { paystackReference: 'ref-1' },
      {
        $set: {
          status: TransactionStatus.SUCCESS,
          paymentDetails: expect.anything(),
        },
      },
    );
    expect(discounts.incrementUse).toHaveBeenCalledWith('SAVE');
    expect(notifications.purchaseSucceeded).toHaveBeenCalled();
  });

  it('markSuccessIfValidPaystack marks failed when verification mismatches', async () => {
    const { service, txModel, notifications } = makeService();
    txModel.findOne.mockResolvedValue({
      _id: 't1',
      totalAmount: 2000,
      currency: 'NGN',
      status: TransactionStatus.PENDING,
    });

    await service.markSuccessIfValidPaystack('ref-2', {
      amount: 100000, // wrong amount
      currency: 'NGN',
      status: 'success',
    });

    expect(txModel.updateOne).toHaveBeenCalledWith(
      { paystackReference: 'ref-2' },
      {
        $set: {
          status: TransactionStatus.FAILED,
          paymentDetails: expect.anything(),
        },
      },
    );
    expect(notifications.purchaseFailed).toHaveBeenCalled();
  });

  it('idempotency: markSuccessByReference does nothing if already SUCCESS', async () => {
    const { service, txModel } = makeService();
    txModel.findOne.mockResolvedValue({ status: TransactionStatus.SUCCESS });
    await service.markSuccessByReference('r', {});
    expect(txModel.updateOne).not.toHaveBeenCalled();
  });

  it('adminRefund updates status and paymentDetails', async () => {
    const { service, txModel, paystack } = makeService();
    txModel.findById.mockResolvedValue({ paystackReference: 'r1' });
    paystack.refund.mockResolvedValue({ refunded: true });
    const res = await service.adminRefund('tid', 100);
    expect(paystack.refund).toHaveBeenCalledWith('r1', 100);
    expect(txModel.updateOne).toHaveBeenCalledWith(
      { _id: 'tid' },
      {
        $set: {
          status: TransactionStatus.REFUNDED,
          paymentDetails: { refunded: true },
        },
      },
    );
    expect(res).toEqual({ refunded: true, refund: { refunded: true } });
  });

  it('getUserHistory paginates', async () => {
    const { service, txModel } = makeService();
    txModel.find.mockReturnValue(chainableFindMock([{ _id: 1 }]));
    txModel.countDocuments.mockResolvedValue(1);
    const out = await service.getUserHistory('u1', { page: 2, limit: 5 });
    expect(out.total).toBe(1);
    expect(out.page).toBe(2);
    expect(out.limit).toBe(5);
  });
});
