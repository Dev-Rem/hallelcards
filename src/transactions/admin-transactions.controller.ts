import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminMetricsSummaryDto,
  AdminPurchaseDetailResponseDto,
  AdminPurchaseListResponseDto,
  RefundResponseDto,
  TopBrandMetricDto,
} from './dto/admin-responses.dto';
import { TransactionsService } from './transactions.service';
import { AdminQueryPurchasesDto } from './dto/admin-query-purchases.dto';
import { Roles } from '../common/roles.decorator';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TransactionStatus } from './schemas/transaction.schema';
import { AdminRefundDto } from './dto/admin-refund.dto';

@ApiTags('admin-purchases')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/purchases')
export class AdminTransactionsController {
  constructor(private readonly tx: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List purchases with filters and pagination' })
  @ApiOkResponse({
    description: 'Admin purchases list',
    type: AdminPurchaseListResponseDto,
  })
  async list(@Query() query: AdminQueryPurchasesDto) {
    return this.tx.adminQueryPurchases(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase detail by id' })
  @ApiParam({ name: 'id', description: 'Transaction id' })
  @ApiOkResponse({
    description: 'Purchase detail',
    type: AdminPurchaseDetailResponseDto,
  })
  async detail(@Param('id') id: string) {
    return this.tx.adminGetPurchaseById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update purchase status' })
  @ApiParam({ name: 'id', description: 'Transaction id' })
  @ApiOkResponse({ description: 'Status updated', type: Object })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TransactionStatus,
  ) {
    return this.tx.adminUpdateStatus(id, status);
  }

  @Get('metrics/summary')
  @ApiOperation({ summary: 'Get summary metrics for purchases' })
  @ApiOkResponse({
    description: 'Summary metrics',
    type: AdminMetricsSummaryDto,
  })
  async summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.tx.adminMetricsSummary(from, to);
  }

  @Get('metrics/top-brands')
  @ApiOperation({ summary: 'Top brands by revenue' })
  @ApiOkResponse({
    description: 'Top brands by revenue',
    type: [TopBrandMetricDto],
  })
  async topBrands(
    @Query('limit') limit = 10,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.tx.adminTopBrands(Number(limit), from, to);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Initiate refund through Paystack' })
  @ApiParam({ name: 'id', description: 'Transaction id' })
  @ApiOkResponse({ description: 'Refund initiated', type: RefundResponseDto })
  async refund(@Param('id') id: string, @Body() body: AdminRefundDto) {
    return this.tx.adminRefund(id, body.amount);
  }
}
