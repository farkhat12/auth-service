import { Request, Response } from 'express';
import { phoneFormatter } from 'src/helpers/phone-formatter';
import { AuthRepo } from 'src/repositories/auth.repository';
import { OtpService } from './otp.service';
import { loginDto } from 'src/shared/dto/auth/login.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { setToken } from 'src/helpers/set-token';
import { TokenService } from './token.service';
import { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  forgotPhoneDto,
  RegisterDto,
} from 'src/shared/dto/auth/register.dto';
import { AuthenticatedRequest } from 'src/modules/profile/profile.controller';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private readonly authRepo: AuthRepo,
    private tokenService: TokenService,
    private readonly otpService: OtpService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}
  async chechPhone(data: string) {
    const phone = phoneFormatter(data);
    const blockedKey = `block:register_otp:${phone}`;
    const isBlocked = await this.redis.get(blockedKey);
    if (isBlocked)
      throw new ForbiddenException(`You are blocked for 15 minutes`);
    await this.authRepo.checkPhone(phone);
    return { message: 'Phone number is available', success: true };
  }
  async register(data: RegisterDto) {
    const phone = phoneFormatter(data.phone);
    await this.authRepo.checkPhone(phone);
    data.phone = phone;
    const createdData = await Promise.all([
      this.authRepo.createUser(data),
      this.otpService.createOtp(phone, 'register_otp'),
    ]);

    return {
      message: `OTP sent`,
      success: true,
      expiresAt: createdData[1],
    };
  }

  async login(data: loginDto, res: Response) {
    const phone = phoneFormatter(data.phone);
    const user = await this.userModel.findOne({ phone });

    if (!user)
      throw new UnauthorizedException('Incorrect password or phone number');
    const { name, user_id, createdAt } = user;
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Incorrect password or phone number');
    const tokens = await this.tokenService.generateTokens(
      user.user_id,
      user.phone,
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

    return {
      message: 'Successful logged in',
      success: true,
      user: { name, phone, user_id, createdAt },
    };
  }
  async forgotPassword(data: forgotPhoneDto) {
    const phone = phoneFormatter(data.phone);
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new UnauthorizedException('User not found');
    const expiresAt = await this.otpService.createOtp(
      phone,
      'reset_password_otp',
    );

    return { message: `OTP sent to +${phone}`, success: true, expiresAt };
  }
  async changePassword(data: ChangePasswordDto, req: Request, res: Response) {
    const resetPasswordToken = req.cookies['reset_password_token'];
    if (!resetPasswordToken) throw new UnauthorizedException('Token not found');
    const payload = await this.tokenService.verifyToken(
      resetPasswordToken,
      'reset_password',
    );
    const user = await this.userModel.findOne({ phone: payload.phone });
    if (!user) throw new UnauthorizedException('User not found');
    try {
      await this.authRepo.updatePassword(payload.phone, data.password);
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('New password not set');
    }
    res.clearCookie('reset_password_token', {
      httpOnly: true,
      sameSite: 'strict',
    });
    return { success: true, message: `Password changed successfully` };
  }
  async refresh(req: AuthenticatedRequest, res: Response) {
    const phone = await req.user;

    const isExist = await this.authRepo.findByPhone(phone.phone);

    const tokens = await this.tokenService.generateTokens(
      isExist.user_id,
      isExist.phone,
    );

    const { name, createdAt, user_id } = isExist;

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
    return {
      message: 'Tokens refreshed',
      user: { name, phone, user_id, createdAt },
    };
  }

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      const phone = await req.user.phone;

      const isExist = await this.authRepo.findByPhone(phone);
      const { name, user_id, createdAt } = isExist;

      const tokens = await this.tokenService.generateTokens(
        isExist.user_id,
        isExist.phone,
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

      return {
        message: 'Successful logged in',
        user: { name, phone, user_id, createdAt },
      };
    } catch (error) {
      throw new InternalServerErrorException('errorrooroorooro');
    }
  }
  async logout(res: Response) {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'strict' });

    return { message: 'Logged out successfully', success: true };
  }
}
