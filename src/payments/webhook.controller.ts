import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from '../transactions/transactions.service';
import { PaystackService } from './paystack.service';

@ApiTags('payments')
@Controller('payments/webhook')
export class WebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly tx: TransactionsService,
    private readonly paystack: PaystackService,
  ) {}

  @Post('paystack')
  async handlePaystack(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: any,
  ) {
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY');
    const computed = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (computed !== signature) return { ok: false };

    const event = payload?.event as string;
    const reference = payload?.data?.reference as string;
    if (!reference) return { ok: true };

    if (event?.includes('success')) {
      const verification = await this.paystack.verify(reference);
      await this.tx.markSuccessByReference(reference, verification);
    } else if (event?.includes('failed')) {
      await this.tx.markFailedByReference(reference, payload);
    }
    return { ok: true };
  }
}
