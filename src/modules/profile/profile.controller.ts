import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { ChangePasswordDto } from 'src/shared/dto/profile/change-password.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

@UseGuards(AccessTokenGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  // ------------------ MY PROFILE -------------------- //
  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    return await this.profileService.getProfile(req);
  }
  // ---------------- CHANGE PASSWORD ----------------- //
  @Put('change-password')
  async changePassword(@Body() data: ChangePasswordDto, @Req() req: Request) {
    return await this.profileService.changePassword(data, req);
  }
  // ------------ CHANGE APARTMENT STATUS -------------- //
  @Patch('apartments/:apartmentId')
  async changeApartmentStatus(
    @Param('apartmentId') apartmentId: string,
    @Query('status') status: 'active' | 'archived',
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.profileService.changeApartmentStatus(
      apartmentId,
      status,
      req,
    );
  }
  // ------------------ DELETE APARTMENT ----------------- //
  @Delete('apartments/:apartmentId')
  async removeApartment(
    @Param('apartmentId') apartmentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.profileService.removeApartment(apartmentId, req);
  }
}
