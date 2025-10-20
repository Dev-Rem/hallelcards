import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ _id: false })
class Price {
  @Prop({ required: true }) min: number;
  @Prop({ required: true }) max: number;
  @Prop({ required: true }) currencyCode: string;
}

@Schema({ _id: false })
class Converted {
  @Prop() minUsd: number;
  @Prop() maxUsd: number;
  @Prop() minNgn: number;
  @Prop() maxNgn: number;
}

@Schema({ _id: false })
class Product {
  @Prop({ type: Price, required: true }) price: Price;

  @Prop({ required: true }) id: number;

  @Prop({ required: true }) name: string;

  @Prop({ required: true }) minFaceValue: number;

  @Prop({ required: true }) maxFaceValue: number;

  @Prop() count: number;

  @Prop({ required: true }) modifiedDate: Date;

  @Prop({ type: Converted }) converted: Converted;
}

@Schema({ _id: false })
class Category {
  @Prop({ required: true }) id: number;

  @Prop({ required: true }) name: string;

  @Prop() description: string;
}

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true }) internalId: string;

  @Prop({ required: true }) name: string;

  @Prop({ required: true }) countryCode: string;

  @Prop({ required: true }) currencyCode: string;

  @Prop() description: string;

  @Prop() disclaimer: string;

  @Prop() redemptionInstructions: string;

  @Prop() terms: string;

  @Prop() logoUrl: string;

  @Prop({ required: true }) modifiedDate: Date;

  @Prop({ type: [Product], default: [] }) products: Product[];

  @Prop({ type: [Category], default: [] }) categories: Category[];

  @Prop({ default: 0 }) __v: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
