import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
import { WebhookController } from './webhook.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [ConfigModule, forwardRef(() => TransactionsModule)],
  controllers: [PaymentsController, WebhookController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}
