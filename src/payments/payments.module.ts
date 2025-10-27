import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
import { WebhookController } from './webhook.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { WebhookEvent, WebhookEventSchema } from './schemas/webhook-event.schema';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => TransactionsModule),
    MongooseModule.forFeature([{ name: WebhookEvent.name, schema: WebhookEventSchema }]),
  ],
  controllers: [PaymentsController, WebhookController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}
