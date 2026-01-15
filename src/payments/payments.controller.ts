import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaystackService } from './paystack.service';
import { PaystackInitRequestDto, PaystackInitResponseDto } from './dto/payments.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paystack: PaystackService) {}

  // Optional direct init endpoint; primary flow uses /purchase
  @Post('paystack/init')
  @ApiOperation({ summary: 'Initialize a Paystack payment session' })
  @ApiOkResponse({ description: 'Paystack init payload', type: PaystackInitResponseDto })
  async init(@Body() body: PaystackInitRequestDto) {
    return this.paystack.initializePayment(body.email, body.amount);
  }
}
