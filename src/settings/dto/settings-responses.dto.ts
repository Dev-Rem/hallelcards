import { ApiProperty } from '@nestjs/swagger';

export class GlobalMarkupDto {
  @ApiProperty() globalMarkupPercentage!: number;
}


