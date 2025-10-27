import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ required: true }) provider: string; // e.g., 'paystack'

  @Prop({ required: true }) event: string;

  @Prop({ required: false }) reference?: string;

  @Prop({ default: false }) signatureValid: boolean;

  @Prop({ type: Object }) payload: Record<string, unknown>;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

