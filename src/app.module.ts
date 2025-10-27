import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

// Feature modules (implemented in this scaffold)
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { SettingsModule } from './settings/settings.module';
import { DiscountsModule } from './discounts/discounts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        autoIndex: true,
      }),
    }),
    AuthModule,
    UsersModule,
    CardsModule,
    TransactionsModule,
    PaymentsModule,
    SettingsModule,
    DiscountsModule,
    NotificationsModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
