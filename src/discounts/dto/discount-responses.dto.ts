import { ApiProperty } from '@nestjs/swagger';

export class DiscountViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() type!: string;
  @ApiProperty() value!: number;
  @ApiProperty() active!: boolean;
}

export class DeletedResponseDto {
  @ApiProperty() deleted!: boolean;
}


