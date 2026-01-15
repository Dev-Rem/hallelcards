import { ApiProperty } from '@nestjs/swagger';
import {
  AdminPurchaseListResponseDto,
  TransactionViewDto,
} from './admin-responses.dto';

export class PaystackInitPayloadDto {
  @ApiProperty() authorization_url!: string;
  @ApiProperty() reference!: string;
}

export class PurchaseInitResponseDto {
  @ApiProperty() transactionId!: string;
  @ApiProperty({ type: PaystackInitPayloadDto })
  paystack!: PaystackInitPayloadDto;
}

export class UserPurchaseListResponseDto extends AdminPurchaseListResponseDto {
  @ApiProperty({ type: [TransactionViewDto] }) items: TransactionViewDto[] = [];
}
