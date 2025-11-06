import {
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { RedisClientType } from 'redis';
import { getFormattedDate } from 'src/helpers/date-formatter';
import { generateNumber } from 'src/helpers/generate-number';
import { phoneFormatter } from 'src/helpers/phone-formatter';
import { User, UserDocument } from 'src/schemas/user.schema';
import { VerifyOtpDto } from 'src/shared/dto/auth/register.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';
import { setToken } from 'src/helpers/set-token';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly OTP_PREFIX = 'otp';
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_SECONDS = 60 * 15;
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async createOtp(
    data: string,
    purpose: 'register_otp' | 'reset_password_otp',
  ) {
    const phone = phoneFormatter(data);
    const key = this.getOtpKey(phoneFormatter(phone), purpose);
    const blockedKey = this.getBlockedKey(phone, purpose);
    const isBlocked = await this.redis.get(blockedKey);
    if (isBlocked)
      throw new ForbiddenException(
        `You are blocked for ${this.BLOCK_SECONDS / 60} minutes`,
      );
    const otpData = await this.redis.get(key);
    if (otpData) {
      const { expiresAt } = JSON.parse(otpData);
      const now = new Date();
      const isOtpExpired = now > new Date(expiresAt);
      if (!isOtpExpired) return JSON.parse(otpData).expiresAt;
    }

    const generatedOtp = generateNumber(6);
    console.log('otp:', generatedOtp);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 1);
    const hashedOtp = await bcrypt.hash(generatedOtp, 9);
    const payload = JSON.stringify({ otp: hashedOtp, expiresAt });
    // Sending OTP service
    await this.redis.set(key, payload, { EX: this.BLOCK_SECONDS });
    return expiresAt;
  }

  async verifyOtp(
    data: VerifyOtpDto,
    purpose: 'register_otp' | 'reset_password_otp',
    res: Response,
  ) {
    const phone = phoneFormatter(data.phone);
    // Checking otp start
    if (data) new NotFoundException('OTP not found');

    const otpKey = this.getOtpKey(phone, purpose);
    const attemptsKey = this.getAttemptsKey(phone, purpose);

    const otpData = await this.redis.get(otpKey);
    if (!otpData) throw new NotFoundException('OTP not found');
    const { otp: storedOtp, expiresAt } = JSON.parse(otpData);
    const blockedKey = this.getBlockedKey(phone, purpose);
    const isBlocked = await this.redis.get(blockedKey);
    if (isBlocked)
      throw new ForbiddenException(
        `You are blocked for ${this.BLOCK_SECONDS / 60} minutes`,
      );
    const isOtpTrue = await bcrypt.compare(data.otp, storedOtp);
    // ------------------- wrong area ----------------- //
    if (!isOtpTrue) {
      const attempts = await this.redis.incr(attemptsKey);
      await this.redis.expire(attemptsKey, this.BLOCK_SECONDS);
      const remaining = this.MAX_ATTEMPTS - attempts;

      if (1 < attempts && attempts < this.MAX_ATTEMPTS)
        throw new UnauthorizedException(`You have ${remaining} attempts left`);

      if (attempts === this.MAX_ATTEMPTS) {
        await this.redis.del(attemptsKey);
        await this.redis.set(blockedKey, '1', { EX: 300 });
        throw new ForbiddenException(
          `You are blocked for ${this.BLOCK_SECONDS / 60} minutes`,
        );
      }

      throw new UnauthorizedException('OTP is wrong');
    }
    // ------------------- wrong area ---------------- //
    const now = new Date();
    const isOtpExpired = now > new Date(expiresAt);
    if (isOtpExpired) throw new GoneException('OTP expired');
    if (purpose === 'register_otp') {
      const UserData = await this.redis.get(`temp_user:${phone}`);
      if (!UserData) throw new NotFoundException('Temporary user not found');
      const userData = JSON.parse(UserData);
      userData.createdAt = getFormattedDate();
      await this.userModel.create(userData);
      const tokens = await this.tokenService.generateTokens(
        userData.user_id,
        userData.phone,
      );

      setToken(
        tokens.access_token,
        60 * 60 * 1000,
        'access',
        this.configService,
        res,
      );
      setToken(
        tokens.refresh_token,
        7 * 24 * 60 * 60 * 1000,
        'refresh',
        this.configService,
        res,
      );

      res.json({ message: 'Successful created', success: true });
    } else if (purpose === 'reset_password_otp') {
      const userData = await this.userModel.findOne({ phone });
      if (!userData) throw new NotFoundException('User not found');
      const token = await this.tokenService.generateResetToken(
        userData.user_id,
        phone,
      );

      setToken(token, 2 * 60 * 1000, 'reset_password', this.configService, res);
      res.json({
        message: 'You have access to change password',
        success: true,
      });
    }
    await Promise.all([this.redis.del(otpKey), this.redis.del(attemptsKey)]);
  }

  private getOtpKey(
    phone: string,
    purpose: 'register_otp' | 'reset_password_otp',
  ) {
    return `${this.OTP_PREFIX}:${purpose}:${phone}`;
  }
  private getAttemptsKey(
    phone: string,
    purpose: 'register_otp' | 'reset_password_otp',
  ) {
    return `otp_attempts:${purpose}:${phone}`;
  }
  private getBlockedKey(
    phone: string,
    purpose: 'register_otp' | 'reset_password_otp',
  ) {
    return `block:${purpose}:${phone}`;
  }
}
