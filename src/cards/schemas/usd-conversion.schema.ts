import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsdConversionDocument = UsdConversion & Document;

@Schema({ timestamps: true })
export class UsdConversion {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  currencyCode: string; // e.g. "KPW"

  @Prop({ required: true })
  value: number; // conversion rate to USD

  @Prop({ default: Date.now })
  dateModified: Date; // when last updated
}

export const UsdConversionSchema = SchemaFactory.createForClass(UsdConversion);
