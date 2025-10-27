import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class AdminRefundDto {
  @ApiProperty({ required: false, description: 'Amount in Naira to refund; omit for full refund' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}


