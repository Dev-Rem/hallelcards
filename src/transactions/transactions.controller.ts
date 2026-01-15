import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueryHistoryDto, GuestHistoryDto } from './dto/query-history.dto';
import {
  PurchaseInitResponseDto,
  UserPurchaseListResponseDto,
} from './dto/purchase-responses.dto';

@ApiTags('purchase')
@Controller()
export class TransactionsController {
  constructor(private readonly tx: TransactionsService) {}

  @Post('purchase')
  @ApiOperation({ summary: 'Initiate purchase (guest)' })
  @ApiOkResponse({
    description: 'Purchase initiated; Paystack init payload',
    type: PurchaseInitResponseDto,
  })
  async purchaseGuest(@Body() dto: CreatePurchaseDto) {
    return this.tx.createPurchase(dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('purchase/auth')
  @ApiOperation({ summary: 'Initiate purchase (authenticated user)' })
  @ApiOkResponse({
    description: 'Purchase initiated; Paystack init payload',
    type: PurchaseInitResponseDto,
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
  @ApiOperation({ summary: 'List purchase history for current user' })
  @ApiOkResponse({
    description: 'Paginated user purchases',
    type: UserPurchaseListResponseDto,
  })
  async myPurchases(@Req() req: any, @Query() query: QueryHistoryDto) {
    return this.tx.getUserHistory(req.user.userId, query);
  }

  @Get('guest/purchases')
  @ApiOperation({ summary: 'List guest purchase history by email' })
  @ApiOkResponse({
    description: 'Paginated guest purchases',
    type: UserPurchaseListResponseDto,
  })
  async guestPurchases(@Query() query: GuestHistoryDto) {
    return this.tx.getGuestHistory(query.email, query);
  }
}
