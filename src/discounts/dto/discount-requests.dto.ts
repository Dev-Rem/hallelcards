import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DiscountType } from '../schemas/discount.schema';

export class CreateDiscountRequestDto {
  @ApiProperty({
    example: 'SAVE10',
    description: 'Unique code, case-insensitive',
  })
  @IsString()
  code!: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  type!: DiscountType;

  @ApiProperty({
    description: 'Percent (0-100) or amount in NGN depending on type',
  })
  @IsNumber()
  value!: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ required: false, description: 'ISO date string' })
  @IsOptional()
  @IsString()
  startsAt?: string;

  @ApiProperty({ required: false, description: 'ISO date string' })
  @IsOptional()
  @IsString()
  endsAt?: string;

  @ApiProperty({ required: false, description: 'Minimum order amount in NGN' })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxUses?: number;
}

export class UpdateDiscountRequestDto extends CreateDiscountRequestDto {}
