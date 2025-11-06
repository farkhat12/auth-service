import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenService } from '../auth/services/token.service';
import { AuthRepo } from 'src/repositories/auth.repository';
import { ChangePasswordDto } from 'src/shared/dto//profile/change-password.dto';
import * as bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class ProfileService {
  constructor(
    private tokenService: TokenService,
    private authRepo: AuthRepo,
  ) {}
  async getProfile(req: AuthenticatedRequest, res: Response) {
    const user = await this.authRepo.findByPhone(req?.user.phone);

    const filteredUser = {
      id: user.user_id,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
    };

    res.json({ message: 'helo user', user: filteredUser });
  }

  async changePassword(data: ChangePasswordDto, req: Request, res: Response) {
    const accessToken = req.cookies['access_token'];
    if (!accessToken) throw new UnauthorizedException('Token not found');
    const payload = await this.tokenService.verifyToken(accessToken, 'access');
    const user = await this.authRepo.findByPhone(payload.phone);

    const isPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Old password is incorrect');

    await this.authRepo.updatePassword(user.phone, data.password);
    res.json({ success: true, message: `Password changed successfully` });
  }
}
