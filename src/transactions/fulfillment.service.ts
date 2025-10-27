import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../cards/schemas/catalog.schema';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FulfillmentService {
  private readonly logger = new Logger(FulfillmentService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    private readonly notifications: NotificationsService,
    private readonly users: UsersService,
  ) {}

  async fulfillAndEmail(tx: Transaction | TransactionDocument): Promise<void> {
    try {
      const baseUrl = this.config.get<string>('THIRD_PARTY_API_URL');
      const apiKey = this.config.get<string>('THIRD_PARTY_API_KEY');
      if (!baseUrl || !apiKey) return;

      const brand = await this.brandModel.findById(tx.card).lean();
      const product = brand?.products?.find((p: any) => String(p.id) === String(tx.productId));
      const value = product?.minFaceValue ?? tx['unitPrice'] ?? undefined;

      const order = {
        products: [
          {
            ProductId: Number(tx.productId),
            Quantity: tx.quantity || 1,
            Value: value,
          },
        ],
      };

      const { data } = await axios.post(
        `${baseUrl.replace(/\/$/, '')}/order`,
        order,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          timeout: 120000,
        },
      );

      let email = (tx as any).guestEmail as string | undefined;
      if (!email && (tx as any).user) {
        const user = await this.users.findById(String((tx as any).user));
        email = user?.email;
      }
      if (!email) return;

      await this.notifications.sendCardDelivery(email, data);
    } catch (err) {
      this.logger.error('Fulfillment failed', err as any);
    }
  }
}


