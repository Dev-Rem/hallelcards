/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PaystackService } from './paystack.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaystackService', () => {
  const makeService = () => {
    const config: any = {
      get: jest.fn((k: string) =>
        k === 'PAYSTACK_SECRET_KEY' ? 'sk' : undefined,
      ),
    };
    return new PaystackService(config);
  };

  it('initializePayment posts initialize with kobo amount', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { data: { authorization_url: 'u', reference: 'r' } },
    } as any);
    const svc = makeService();
    const out = await svc.initializePayment('e@e.com', 123.45);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      { email: 'e@e.com', amount: 12345 },
      { headers: { Authorization: 'Bearer sk' } },
    );
    expect(out.reference).toBe('r');
  });

  it('verify hits verify endpoint and returns data', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { status: 'success' } },
    } as any);
    const svc = makeService();
    const out = await svc.verify('ref');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/verify/ref',
      { headers: { Authorization: 'Bearer sk' } },
    );
    expect(out.status).toBe('success');
  });

  it('refund posts refund with optional kobo amount', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { data: { status: 'success' } },
    } as any);
    const svc = makeService();
    await svc.refund('ref', 100);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.paystack.co/refund',
      { reference: 'ref', amount: 10000 },
      { headers: { Authorization: 'Bearer sk' } },
    );
  });
});
