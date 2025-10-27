import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaystackService } from './paystack.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paystack: PaystackService) {}

  // Optional direct init endpoint; primary flow uses /purchase
  @Post('paystack/init')
  @ApiOkResponse({
    description: 'Initialize a Paystack payment session',
    schema: {
      type: 'object',
      properties: {
        authorization_url: { type: 'string' },
        reference: { type: 'string' },
      },
    },
  })
  async init(@Body() body: { email: string; amount: number }) {
    return this.paystack.initializePayment(body.email, body.amount);
  }
}
