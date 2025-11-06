import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import {
  ChangePasswordDto,
  checkPhoneDto,
  forgotPhoneDto,
  RegisterDto,
  VerifyOtpDto,
} from 'src/shared/dto/auth/register.dto';
import { loginDto } from 'src/shared/dto/auth/login.dto';
import { Request, Response } from 'express';
import { OtpService } from './services/otp.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}
  // ------------------- CHECK PHONE ------------------- //
  @Post('check-phone')
  async checkPhone(@Body() data: checkPhoneDto, @Res() res: Response) {
    return await this.authService.chechPhone(data.phone, res);
  }

  // -------------------- REGISTER --------------------- //
  @Post('register')
  async register(@Body() data: RegisterDto, @Res() res: Response) {
    return await this.authService.register(data, res);
  }
  // ------------------- VERIFY OTP -------------------- //
  @Post('verify-otp')
  async verifyOTP(@Body() data: VerifyOtpDto, @Res() res: Response) {
    return await this.otpService.verifyOtp(data, 'register_otp', res);
  }

  // ---------------------- LOGIN ---------------------- //
  @Post('login')
  async login(@Body() data: loginDto, @Res() res: Response) {
    return await this.authService.login(data, res);
  }

  // ------------------ FORGOT PASSWORD ---------------- //
  @Post('forgot-password')
  async forgotPassword(@Body() data: forgotPhoneDto, @Res() res: Response) {
    return await this.authService.forgotPassword(data, res);
  }
  // ----------------- VERIFY RESET OTP ---------------- //
  @Post('verify-reset-otp')
  async verifyResetOTP(@Body() data: VerifyOtpDto, @Res() res: Response) {
    return await this.otpService.verifyOtp(data, 'reset_password_otp', res);
  }

  // ------------------ CHANGE PASSWORD ---------------- //
  @Post('change-password')
  async changePassword(
    @Body() data: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.changePassword(data, req, res);
  }

  // ------------------- REFRESH ---------------------- //
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refresh(req, res);
  }

  // -------------------- LOGOUT ---------------------- //
  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }
}
