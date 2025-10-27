import { ApiProperty } from '@nestjs/swagger';

export class TransactionViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
  @ApiProperty() totalAmount!: number;
  @ApiProperty({ required: false }) paystackReference?: string;
  @ApiProperty() createdAt!: Date;
}

export class AdminPurchaseListResponseDto {
  @ApiProperty({ type: [TransactionViewDto] }) items!: TransactionViewDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}

export class AdminPurchaseDetailResponseDto {
  @ApiProperty({ type: Object }) purchase!: Record<string, unknown>;
}

export class RefundResponseDto {
  @ApiProperty() refunded!: boolean;
  @ApiProperty({ type: Object }) refund!: Record<string, unknown>;
}

export class StatusMetricDto {
  @ApiProperty() _id!: string; // status
  @ApiProperty() count!: number;
  @ApiProperty() revenue!: number;
}

export class AdminMetricsSummaryDto {
  @ApiProperty() totalOrders!: number;
  @ApiProperty() revenue!: number;
  @ApiProperty({ type: [StatusMetricDto] }) byStatus!: StatusMetricDto[];
}

export class TopBrandMetricDto {
  @ApiProperty() _id!: string; // brand id
  @ApiProperty() orders!: number;
  @ApiProperty() revenue!: number;
}


