import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailVerificationTokenDocument = EmailVerificationToken & Document;

@Schema({ timestamps: true })
export class EmailVerificationToken {
  @Prop({ required: true, index: true, unique: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, expires: 0 })
  expiresAt: Date;
}

export const EmailVerificationTokenSchema = SchemaFactory.createForClass(
  EmailVerificationToken,
);
// EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
