import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueryHistoryDto, GuestHistoryDto } from './dto/query-history.dto';

@ApiTags('purchase')
@Controller()
export class TransactionsController {
  constructor(private readonly tx: TransactionsService) {}

  @Post('purchase')
  @ApiOkResponse({
    description: 'Purchase initiated; paystack init payload returned',
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string' },
        paystack: {
          type: 'object',
          properties: {
            authorization_url: { type: 'string' },
            reference: { type: 'string' },
          },
        },
      },
    },
  })
  async purchaseGuest(@Body() dto: CreatePurchaseDto) {
    return this.tx.createPurchase(dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('purchase/auth')
  @ApiOkResponse({
    description: 'Purchase initiated for authenticated user',
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string' },
        paystack: {
          type: 'object',
          properties: {
            authorization_url: { type: 'string' },
            reference: { type: 'string' },
          },
        },
      },
    },
  })
  async purchaseAuth(@Req() req: any, @Body() dto: CreatePurchaseDto) {
    return this.tx.createPurchase(dto, {
      userId: req.user.userId,
      email: req.user.email,
    });
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me/purchases')
  async myPurchases(@Req() req: any, @Query() query: QueryHistoryDto) {
    return this.tx.getUserHistory(req.user.userId, query);
  }

  @Get('guest/purchases')
  async guestPurchases(@Query() query: GuestHistoryDto) {
    return this.tx.getGuestHistory(query.email, query);
  }
}
