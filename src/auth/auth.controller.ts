import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetPasswordDto } from './dto/verify-reset-password.dto';
import {
  AdminLoginResponseDto,
  LoginResponseDto,
  RegisterResponseDto,
  ResetPasswordRequestResponseDto,
  VerifyEmailResponseDto,
  VerifyResetPasswordResponseDto,
} from './dto/auth-responses.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({
    description: 'Registration successful',
    type: RegisterResponseDto,
  })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Login successful', type: LoginResponseDto })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login with elevated token' })
  @ApiOkResponse({
    description: 'Admin login successful',
    type: AdminLoginResponseDto,
  })
  async adminLogin(@Body() dto: LoginDto) {
    return this.auth.adminLogin(dto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify email with token sent to inbox' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Email verification token',
  })
  @ApiOkResponse({
    description: 'Email verified',
    type: VerifyEmailResponseDto,
  })
  async verify(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Send reset password email' })
  @ApiOkResponse({
    description: 'Reset password email dispatched (if account exists)',
    type: ResetPasswordRequestResponseDto,
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.sendResetPasswordEmail(dto);
  }

  @Post('verify-reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Reset password token',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
    type: VerifyResetPasswordResponseDto,
  })
  async verifyResetPassword(
    @Body() dto: VerifyResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.auth.verifyResetPasswordToken(token, dto);
  }
}
