import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus } from './schemas/transaction.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Inject, forwardRef } from '@nestjs/common';
import { PaystackService } from '../payments/paystack.service';
import { Brand, BrandDocument } from '../cards/schemas/catalog.schema';
import { SettingsService } from '../settings/settings.service';
import { DiscountsService } from '../discounts/discounts.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly txModel: Model<TransactionDocument>,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    @Inject(forwardRef(() => PaystackService))
    private readonly paystack: PaystackService,
    private readonly settings: SettingsService,
    private readonly discounts: DiscountsService,
    private readonly notifications: NotificationsService,
  ) {}
  async getByReference(reference: string) {
    return this.txModel.findOne({ paystackReference: reference });
  }

  private computePriceWithMarkup(base: number, markupPercentage: number) {
    return base * (1 + markupPercentage / 100);
  }

  async createPurchase(
    dto: CreatePurchaseDto,
    user?: { userId: string; email?: string },
  ) {
    const brand = await this.brandModel.findById(dto.cardId).lean();
    if (!brand) throw new NotFoundException('Card not found');
    const product = brand.products.find((p) => String(p.id) === dto.productId);
    if (!product) throw new NotFoundException('Product not found');
    const quantity = dto.quantity;
    if (!quantity || quantity <= 0)
      throw new BadRequestException('Invalid quantity');

    const unitPrice = product.price?.min ?? 0;
    // Determine markup: product override > brand override > global
    const productOverride = (product as any).markupOverride as
      | number
      | undefined;
    const brandOverride = (brand as any).markupOverride as
      | number
      | undefined;
    const globalMarkup = await this.settings.getGlobalMarkup();
    const markupApplied =
      typeof productOverride === 'number'
        ? productOverride
        : typeof brandOverride === 'number'
          ? brandOverride
          : globalMarkup;
    const priceWithMarkup = this.computePriceWithMarkup(
      unitPrice,
      markupApplied,
    );
    let totalAmount = priceWithMarkup * quantity;
    let discountCode: string | undefined;
    let discountAmount: number | undefined;
    if (dto.discountCode) {
      const result = await this.discounts.validateAndCompute(
        dto.discountCode,
        totalAmount,
      );
      discountCode = dto.discountCode.toUpperCase();
      discountAmount = result.discountAmount;
      totalAmount = result.finalAmount;
    }

    const email = user?.email || dto.customer?.email;
    if (!email) throw new BadRequestException('Email required');

    const tx = await this.txModel.create({
      user: user ? new Types.ObjectId(user.userId) : undefined,
      guestEmail: user ? undefined : email,
      card: new Types.ObjectId(dto.cardId),
      productId: dto.productId,
      quantity,
      unitPrice,
      markupApplied,
      totalAmount,
      discountCode,
      discountAmount,
      currency: 'NGN',
      status: TransactionStatus.PENDING,
    });

    const init = await this.paystack.initializePayment(email, totalAmount);
    await this.txModel.updateOne(
      { _id: tx._id },
      { $set: { paystackReference: init.reference } },
    );
    void this.notifications.purchaseInitiated({
      transactionId: tx._id.toString(),
      email,
      amount: totalAmount,
      cardId: dto.cardId,
      productId: dto.productId,
      quantity,
    });
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return { transactionId: tx._id.toString(), paystack: init };
  }

  async markSuccessByReference(reference: string, paymentDetails: any) {
    const tx = await this.txModel.findOne({ paystackReference: reference });
    if (!tx) return;
    // Idempotency: if already success, skip
    if (tx.status === TransactionStatus.SUCCESS) return;
    await this.txModel.updateOne(
      { paystackReference: reference },
      { $set: { status: TransactionStatus.SUCCESS, paymentDetails } },
    );
    if (tx.discountCode) {
      await this.discounts.incrementUse(tx.discountCode as any);
    }
    void this.notifications.purchaseSucceeded({
      reference,
      transactionId: tx._id.toString(),
      amount: tx.totalAmount,
    });
  }

  async markFailedByReference(reference: string, paymentDetails: any) {
    const tx = await this.txModel.findOne({ paystackReference: reference });
    if (!tx) return;
    // Idempotency: if already failed or success, do nothing
    if (
      tx.status === TransactionStatus.FAILED ||
      tx.status === TransactionStatus.SUCCESS
    )
      return;
    await this.txModel.updateOne(
      { paystackReference: reference },
      { $set: { status: TransactionStatus.FAILED, paymentDetails } },
    );
    void this.notifications.purchaseFailed({ reference, reason: 'Webhook failure' });
  }

  // Validate paystack verification payload (amount/currency) before marking success
  async markSuccessIfValidPaystack(reference: string, verification: any) {
    const tx = await this.txModel.findOne({ paystackReference: reference });
    if (!tx) return;
    const expectedKobo = Math.round((tx.totalAmount || 0) * 100);
    const amount = Number(verification?.amount ?? 0);
    const currency = String(verification?.currency || '').toUpperCase();
    const status = String(verification?.status || '').toLowerCase();

    const amountOk = amount === expectedKobo;
    const currencyOk = !tx.currency || currency === String(tx.currency).toUpperCase();
    const statusOk = status === 'success';

    if (amountOk && currencyOk && statusOk) {
      await this.markSuccessByReference(reference, verification);
    } else {
      await this.markFailedByReference(reference, {
        reason: 'Amount/currency/status validation failed',
        verification,
        expectedKobo,
        expectedCurrency: tx.currency,
      });
    }
  }

  // -------- Admin queries --------
  async adminQueryPurchases(query: {
    status?: TransactionStatus;
    userId?: string;
    cardId?: string;
    reference?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.userId) filter.user = new Types.ObjectId(query.userId);
    if (query.cardId) filter.card = new Types.ObjectId(query.cardId);
    if (query.reference) filter.paystackReference = query.reference;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const [items, total] = await Promise.all([
      this.txModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.txModel.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  async adminGetPurchaseById(id: string) {
    return this.txModel.findById(id).lean();
  }

  async adminUpdateStatus(id: string, status: TransactionStatus) {
    await this.txModel.updateOne({ _id: id }, { $set: { status } });
    return { updated: true };
  }

  async adminRefund(id: string, amountNaira?: number) {
    const tx = await this.txModel.findById(id).lean();
    if (!tx || !tx.paystackReference)
      throw new NotFoundException('Transaction not found or no reference');
    const refundRes = await this.paystack.refund(
      tx.paystackReference,
      amountNaira,
    );
    await this.txModel.updateOne(
      { _id: id },
      {
        $set: {
          status: TransactionStatus.REFUNDED,
          paymentDetails: refundRes,
        },
      },
    );
    return { refunded: true, refund: refundRes };
  }

  async adminMetricsSummary(from?: string, to?: string) {
    const match: Record<string, any> = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'SUCCESS'] }, '$totalAmount', 0],
            },
          },
        },
      },
    ];
    const byStatus = await this.txModel.aggregate(pipeline).exec();
    const totalOrders = byStatus.reduce((s, r) => s + (r.count || 0), 0);
    const revenue = byStatus.reduce((s, r) => s + (r.revenue || 0), 0);
    return { totalOrders, revenue, byStatus };
  }

  async adminTopBrands(limit = 10, from?: string, to?: string) {
    const match: Record<string, any> = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: '$card',
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'SUCCESS'] }, '$totalAmount', 0],
            },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ];
    const res = await this.txModel.aggregate(pipeline).exec();
    return res;
  }

  // -------- User history --------
  async getUserHistory(
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const filter = { user: new Types.ObjectId(userId) };
    const [items, total] = await Promise.all([
      this.txModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.txModel.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  async getGuestHistory(
    email: string,
    query: { page?: number; limit?: number },
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const filter = { guestEmail: email };
    const [items, total] = await Promise.all([
      this.txModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.txModel.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }
}
