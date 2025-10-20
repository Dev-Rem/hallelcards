import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetPasswordDto } from './dto/verify-reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto) {
    return this.auth.adminLogin(dto);
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.sendResetPasswordEmail(dto);
  }

  @Post('verify-reset-password')
  async verifyResetPassword(
    @Body() dto: VerifyResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.auth.verifyResetPasswordToken(token, dto);
  }
}
