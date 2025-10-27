import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discount, DiscountDocument, DiscountType } from './schemas/discount.schema';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(Discount.name)
    private readonly discountModel: Model<DiscountDocument>,
  ) {}

  async create(d: Partial<Discount>) {
    return this.discountModel.create(d);
  }

  async list() {
    return this.discountModel.find().sort({ createdAt: -1 }).lean();
  }

  async update(id: string, d: Partial<Discount>) {
    return this.discountModel
      .findByIdAndUpdate(id, { $set: d }, { new: true })
      .lean();
  }

  async delete(id: string) {
    await this.discountModel.deleteOne({ _id: id });
    return { deleted: true };
  }

  async validateAndCompute(code: string, orderAmount: number) {
    const discount = await this.discountModel
      .findOne({ code: code?.toUpperCase(), active: true })
      .lean();
    if (!discount) throw new BadRequestException('Invalid discount code');
    const now = Date.now();
    if (discount.startsAt && discount.startsAt.getTime() > now)
      throw new BadRequestException('Discount not yet active');
    if (discount.endsAt && discount.endsAt.getTime() < now)
      throw new BadRequestException('Discount expired');
    if (discount.maxUses && discount.usedCount >= discount.maxUses)
      throw new BadRequestException('Discount usage limit reached');
    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount)
      throw new BadRequestException('Order does not meet minimum amount');

    let discountAmount = 0;
    if (discount.type === DiscountType.PERCENT) {
      discountAmount = Math.round((orderAmount * discount.value) * 100) / 100 / 100;
    } else {
      discountAmount = Math.min(orderAmount, discount.value);
    }
    const finalAmount = Math.max(0, orderAmount - discountAmount);
    return {
      discount,
      discountAmount,
      finalAmount,
    };
  }

  async incrementUse(id: string) {
    await this.discountModel.updateOne({ _id: id }, { $inc: { usedCount: 1 } });
  }
}


