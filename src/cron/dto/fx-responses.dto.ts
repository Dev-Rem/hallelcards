import { ApiProperty } from '@nestjs/swagger';

export class FxRateDto {
  @ApiProperty() currencyCode!: string;
  @ApiProperty() value!: number;
  @ApiProperty({ required: false }) dateModified?: Date;
}

export class RefreshedDto {
  @ApiProperty() refreshed!: boolean;
}


