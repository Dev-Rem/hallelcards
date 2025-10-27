import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
  }

  async initializePayment(email: string, amountNaira: number) {
    const amountKobo = Math.round(amountNaira * 100);
    const res = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      { email, amount: amountKobo },
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );
    return res.data.data as { authorization_url: string; reference: string };
  }

  async verify(reference: string) {
    const res = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${this.secretKey}` } },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res.data.data;
  }

  async refund(reference: string, amountNaira?: number) {
    const body: Record<string, unknown> = { reference };
    if (typeof amountNaira === 'number') {
      body.amount = Math.round(amountNaira * 100);
    }
    const res = await axios.post(`${this.baseUrl}/refund`, body, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res.data.data;
  }
}
