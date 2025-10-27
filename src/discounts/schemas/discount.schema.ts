import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiscountDocument = Discount & Document;

export enum DiscountType {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

@Schema({ timestamps: true })
export class Discount {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: DiscountType })
  type: DiscountType;

  @Prop({ required: true })
  value: number; // percent (0-100) or amount in NGN depending on type

  @Prop({ default: true })
  active: boolean;

  @Prop()
  startsAt?: Date;

  @Prop()
  endsAt?: Date;

  @Prop()
  minOrderAmount?: number; // NGN

  @Prop()
  maxUses?: number;

  @Prop({ default: 0 })
  usedCount: number;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

