import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request, Response } from 'express';
import { ChangePasswordDto } from 'src/shared/dto/profile/change-password.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@UseGuards(AccessTokenGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @Get()
  async getProfile(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    return await this.profileService.getProfile(req, res);
  }
  @Put('change-password')
  async changePassword(
    @Body() data: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.profileService.changePassword(data, req, res);
  }
}
