import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  user?: Types.ObjectId;

  @Prop({ required: false })
  guestEmail?: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true, index: true })
  card: Types.ObjectId;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  markupApplied: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: false })
  discountCode?: string;

  @Prop({ required: false })
  discountAmount?: number;

  @Prop({ required: true, default: 'NGN' })
  currency: string;

  @Prop({ required: true, enum: TransactionStatus, index: true })
  status: TransactionStatus;

  @Prop({ index: true, unique: true, sparse: true })
  paystackReference?: string;

  @Prop({ type: Object })
  paymentDetails?: Record<string, unknown>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
// TransactionSchema.index(
//   { paystackReference: 1 },
//   { unique: true, sparse: true },
// );
TransactionSchema.index({ user: 1, status: 1 });
