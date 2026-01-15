import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaystackInitRequestDto {
  @ApiProperty() email!: string;
  @ApiProperty() amount!: number; // NGN value (naira)
}

export class PaystackInitResponseDto {
  @ApiProperty() authorization_url!: string;
  @ApiProperty() reference!: string;
}

export class WebhookOkResponseDto {
  @ApiProperty() ok!: boolean;
}

export class WebhookEventPreviewDto {
  @ApiProperty() event!: string;
  @ApiPropertyOptional() data?: Record<string, unknown>;
}
