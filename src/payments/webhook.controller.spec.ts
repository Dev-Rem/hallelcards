import { Test } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from '../transactions/transactions.service';
import { PaystackService } from './paystack.service';
import { getModelToken } from '@nestjs/mongoose';
import { WebhookEvent } from './schemas/webhook-event.schema';
import * as crypto from 'crypto';
import { FulfillmentService } from '../transactions/fulfillment.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  let config: ConfigService;
  let tx: any;
  let paystack: any;
  let whModel: any;
  let fulfillment: any;

  const secret = 'test_secret';

  beforeEach(async () => {
    tx = {
      markSuccessIfValidPaystack: jest.fn(),
      markFailedByReference: jest.fn(),
      getByReference: jest.fn().mockResolvedValue({ _id: 't1' }),
    };
    paystack = { verify: jest.fn().mockResolvedValue({ status: 'success' }) };
    whModel = { create: jest.fn().mockResolvedValue({}) };
    fulfillment = { fulfillAndEmail: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) =>
              k === 'PAYSTACK_SECRET_KEY' ? secret : undefined,
            ),
          },
        },
        { provide: TransactionsService, useValue: tx },
        { provide: PaystackService, useValue: paystack },
        { provide: getModelToken(WebhookEvent.name), useValue: whModel },
        { provide: FulfillmentService, useValue: fulfillment },
      ],
    }).compile();

    controller = moduleRef.get(WebhookController);
    config = moduleRef.get(ConfigService);
  });

  function signPayload(payload: any) {
    return crypto
      .createHmac('sha512', config.get<string>('PAYSTACK_SECRET_KEY'))
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  it('rejects invalid signature', async () => {
    const res = await controller.handlePaystack('bad', {
      event: 'charge.success',
      data: { reference: 'r1' },
    });
    expect(res).toEqual({ ok: false });
    expect(tx.markSuccessIfValidPaystack).not.toHaveBeenCalled();
  });

  it('logs and processes success event', async () => {
    const payload = { event: 'charge.success', data: { reference: 'r1' } };
    const sig = signPayload(payload);
    const res = await controller.handlePaystack(sig, payload as any);
    expect(res).toEqual({ ok: true });
    expect(whModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'paystack',
        event: 'charge.success',
        reference: 'r1',
        signatureValid: true,
      }),
    );
    expect(paystack.verify).toHaveBeenCalledWith('r1');
    expect(tx.markSuccessIfValidPaystack).toHaveBeenCalled();
    expect(fulfillment.fulfillAndEmail).toHaveBeenCalledWith({ _id: 't1' });
  });

  it('routes failed event', async () => {
    const payload = { event: 'charge.failed', data: { reference: 'r2' } };
    const sig = signPayload(payload);
    const res = await controller.handlePaystack(sig, payload as any);
    expect(res).toEqual({ ok: true });
    expect(tx.markFailedByReference).toHaveBeenCalledWith('r2', payload);
  });
});
