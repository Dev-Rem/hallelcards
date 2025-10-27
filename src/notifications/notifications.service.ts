import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService) {}

  private createTransport() {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!user || !pass) return null;
    if (host) {
      return nodemailer.createTransport({ host, auth: { user, pass } });
    }
    // Gmail shortcut when host not provided
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  }

  private getAdminEmail(): string | null {
    return this.config.get<string>('ADMIN_NOTIFY_EMAIL') || null;
  }

  async sendAdmin(subject: string, html: string) {
    const to = this.getAdminEmail();
    const from = this.config.get<string>('SMTP_USER');
    const transporter = this.createTransport();
    if (!to || !from || !transporter) {
      this.logger.warn('Email not sent: missing SMTP or ADMIN_NOTIFY_EMAIL');
      return;
    }
    await transporter.sendMail({ to, from, subject, html });
  }

  async purchaseInitiated(payload: {
    transactionId: string;
    email: string;
    amount: number;
    cardId: string;
    productId: string;
    quantity: number;
  }) {
    const html = `
      <h3>Purchase Initiated</h3>
      <p><b>Tx:</b> ${payload.transactionId}</p>
      <p><b>Email:</b> ${payload.email}</p>
      <p><b>Amount:</b> NGN ${payload.amount}</p>
      <p><b>Card:</b> ${payload.cardId} | <b>Product:</b> ${payload.productId} | <b>Qty:</b> ${payload.quantity}</p>
    `;
    await this.sendAdmin('Purchase Initiated', html);
  }

  async purchaseSucceeded(payload: { reference: string; transactionId: string; amount: number }) {
    const html = `
      <h3>Purchase Succeeded</h3>
      <p><b>Tx:</b> ${payload.transactionId}</p>
      <p><b>Reference:</b> ${payload.reference}</p>
      <p><b>Amount:</b> NGN ${payload.amount}</p>
    `;
    await this.sendAdmin('Purchase Succeeded', html);
  }

  async purchaseFailed(payload: { reference?: string; transactionId?: string; reason?: string }) {
    const html = `
      <h3>Purchase Failed</h3>
      <p><b>Tx:</b> ${payload.transactionId || '-'}</p>
      <p><b>Reference:</b> ${payload.reference || '-'}</p>
      <p><b>Reason:</b> ${payload.reason || 'Unknown'}</p>
    `;
    await this.sendAdmin('Purchase Failed', html);
  }
}


