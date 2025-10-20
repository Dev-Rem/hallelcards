import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../../utils/constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  EmailVerificationToken,
  EmailVerificationTokenDocument,
} from './schemas/email-verification.schema';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetPasswordDto } from './dto/verify-reset-password.dto';

@Injectable()
export class AuthService {
  private readonly bcryptSaltRounds = 12;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(EmailVerificationToken.name)
    private readonly emailTokenModel: Model<EmailVerificationTokenDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).lean();
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptSaltRounds);
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
      name: dto.name || 'Anonymous',
      roles: [UserRole.USER],
      isEmailVerified: false,
    });

    await this.sendVerificationEmail(user._id as string, user.email);
    return {
      id: user._id,
      email: user.email,
      message: 'Registration successful',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      sub: user._id.toString(),
      roles: user.roles,
      email: user.email,
    };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, message: 'Login successful' };
  }

  async adminLogin(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (!user.roles?.includes(UserRole.ADMIN))
      throw new UnauthorizedException('Admin role required');
    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      sub: user._id.toString(),
      roles: user.roles,
      email: user.email,
    };
    const adminSecret =
      this.config.get<string>('JWT_ADMIN_SECRET') ||
      this.config.get<string>('JWT_SECRET');
    const accessToken = await this.jwt.signAsync(payload, {
      secret: adminSecret,
    });
    return { accessToken, message: 'Admin login successful' };
  }

  async sendVerificationEmail(userId: string, email: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await this.emailTokenModel.create({ token, user: userId, expiresAt });

    const appUrl = this.config.get<string>('APP_URL');
    const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
    await transporter.sendMail({
      to: email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'Verify your email',
      text: `Verify your email: ${verifyUrl}`,
      html: `<p>Verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
  }

  async sendResetPasswordEmail(dto: ResetPasswordDto) {
    const token = crypto.randomBytes(32).toString('hex');
    const userId = await this.userModel
      .findOne({ email: dto.email })
      .select('_id');
    if (!userId) throw new BadRequestException('Email not found');
    const expiresAt = new Date(Date.now() + 60 * 60 * 24); // 1h
    await this.emailTokenModel.create({ token, user: userId, expiresAt });

    const appUrl = this.config.get<string>('APP_URL');
    const resetPasswordUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
    await transporter.sendMail({
      to: dto.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'Reset your password',
      text: `Reset your password: ${resetPasswordUrl}`,
      html: `<p>Reset your password:</p><p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>`,
    });
  }
  async verifyResetPasswordToken(token: string, dto: VerifyResetPasswordDto) {
    const record = await this.emailTokenModel.findOne({ token }).lean();
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.userModel.updateOne(
      { _id: record.user },
      {
        $set: {
          passwordHash: await bcrypt.hash(
            dto.newPassword,
            this.bcryptSaltRounds,
          ),
        },
      },
    );
    await this.emailTokenModel.deleteOne({ _id: record._id });
    return { passwordReset: true, message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const record = await this.emailTokenModel.findOne({ token });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.userModel.updateOne(
      { _id: record.user },
      { $set: { isEmailVerified: true } },
    );
    await this.emailTokenModel.deleteOne({ _id: record._id });
    return { verified: true, message: 'Email verified successfully' };
  }
}
