import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() message!: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;
  @ApiProperty() message!: string;
}

export class AdminLoginResponseDto {
  @ApiProperty({ description: 'JWT access token for admin' })
  accessToken!: string;
  @ApiProperty() message!: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty() verified!: boolean;
  @ApiProperty() message!: string;
}

export class ResetPasswordRequestResponseDto {
  @ApiProperty({ example: true }) passwordReset?: boolean;
  @ApiProperty({ example: 'Email sent if account exists' })
  message?: string;
}

export class VerifyResetPasswordResponseDto {
  @ApiProperty() passwordReset!: boolean;
  @ApiProperty() message!: string;
}
