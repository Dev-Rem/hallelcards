import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
} from './schemas/transaction.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PaystackService } from '../payments/paystack.service';
import { Brand, BrandDocument } from '../cards/schemas/catalog.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly txModel: Model<TransactionDocument>,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    private readonly paystack: PaystackService,
  ) {}

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
    const markupApplied = 3; // default global 3%
    const priceWithMarkup = this.computePriceWithMarkup(
      unitPrice,
      markupApplied,
    );
    const totalAmount = priceWithMarkup * quantity;

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
      currency: 'NGN',
      status: TransactionStatus.PENDING,
    });

    const init = await this.paystack.initializePayment(email, totalAmount);
    await this.txModel.updateOne(
      { _id: tx._id },
      { $set: { paystackReference: init.reference } },
    );
    return { transactionId: tx._id.toString(), paystack: init };
  }

  async markSuccessByReference(reference: string, paymentDetails: any) {
    await this.txModel.updateOne(
      { paystackReference: reference },
      { $set: { status: TransactionStatus.SUCCESS, paymentDetails } },
    );
  }

  async markFailedByReference(reference: string, paymentDetails: any) {
    await this.txModel.updateOne(
      { paystackReference: reference },
      { $set: { status: TransactionStatus.FAILED, paymentDetails } },
    );
  }
}
