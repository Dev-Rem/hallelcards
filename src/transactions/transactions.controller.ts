import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('purchase')
@Controller()
export class TransactionsController {
  constructor(private readonly tx: TransactionsService) {}

  @Post('purchase')
  async purchaseGuest(@Body() dto: CreatePurchaseDto) {
    return this.tx.createPurchase(dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('purchase/auth')
  async purchaseAuth(@Req() req: any, @Body() dto: CreatePurchaseDto) {
    return this.tx.createPurchase(dto, {
      userId: req.user.userId,
      email: req.user.email,
    });
  }
}
