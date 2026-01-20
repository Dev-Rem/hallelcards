import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: false }) id?: number; // provider category id (may repeat across brands)
  @Prop({ required: true, index: true }) name: string;
  @Prop() description?: string | null;
  @Prop({ required: false, index: true }) slug?: string;
  @Prop({ required: false, default: 0 }) brandCount?: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ id: 1, name: 1 }, { unique: true, sparse: true });
CategorySchema.index({ name: 'text', description: 'text' });

