import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AdminTransactionsController } from './admin-transactions.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Brand, BrandSchema } from '../cards/schemas/catalog.schema';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from '../payments/payments.module';
import { SettingsModule } from '../settings/settings.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { FulfillmentService } from './fulfillment.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PaymentsModule),
    SettingsModule,
    DiscountsModule,
    NotificationsModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  controllers: [TransactionsController, AdminTransactionsController],
  providers: [TransactionsService, FulfillmentService],
  exports: [TransactionsService, FulfillmentService],
})
export class TransactionsModule {}
