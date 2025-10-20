import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class VerifyResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  confirmNewPassword: string;
}
