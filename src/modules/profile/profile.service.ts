import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../auth/services/token.service';
import { AuthRepo } from 'src/repositories/auth.repository';
import { ChangePasswordDto } from 'src/shared/dto//profile/change-password.dto';
import * as bcrypt from 'bcrypt';
import { AuthenticatedRequest } from './profile.controller';
import { InjectModel } from '@nestjs/mongoose';
import { Apartment } from 'src/schemas/apartment.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProfileService {
  constructor(
    private tokenService: TokenService,
    @InjectModel(Apartment.name) private apartmentModel: Model<Apartment>,
    private authRepo: AuthRepo,
  ) {}
  // -------------------- MY PROFILE ------------------- //
  async getProfile(req: AuthenticatedRequest) {
    try {
      const userId = req.user.user_id;
      const user = await this.authRepo.findByPhone(req.user.phone);

      const myApartmens = await this.apartmentModel
        .find({ ownerId: userId })
        .sort({ createdAt: -1 });

      const filteredUser = {
        id: userId,
        phone: user.phone,
        name: user.name,
        createdAt: user.createdAt,
      };

      return {
        message: 'User information',
        success: true,
        user: filteredUser,
        myApartments: myApartmens,
      };
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error');
    }
  }

  // ------------- CHANGE APARTMENT STATUS ------------- //
  async changeApartmentStatus(
    apartmentId: string,
    status: 'active' | 'archived',
    req: AuthenticatedRequest,
  ) {
    try {
      if (!['active', 'archived'].includes(status))
        throw new BadRequestException('Invalid status value');

      const userId = req.user.user_id;
      const myApartment = await this.apartmentModel
        .findOne({
          ownerId: userId,
          _id: apartmentId,
        })
        .select('name title price location');

      if (!myApartment)
        throw new BadRequestException(`You don't have any apartment`);

      myApartment.status = status;
      await myApartment.save();
      return {
        message: `Apartment is ${status === 'active' ? 'actived' : 'archived'}`,
        status: true,
        apartment: {
          id: apartmentId,
          address: myApartment.address,
          status: myApartment.status,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Unexpected error');
    }
  }
  // ---------------- DELETE APARTMENT  ---------------- //
  async removeApartment(apartmentId: string, req: AuthenticatedRequest) {
    try {
      if (!apartmentId) throw new BadRequestException(`Id not found`);
      const userId = req.user.user_id;
      const myApartment = await this.apartmentModel.findOne({
        ownerId: userId,
        _id: apartmentId,
      });

      if (!myApartment)
        throw new BadRequestException(`You don't have any apartment`);

      await myApartment.deleteOne();

      return {
        message: 'Apartment deleted successfully',
        success: true,
        apartmentId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Unexpected error');
    }
  }

  // ---------------- CHANGE  PASSWORD ----------------- //
  async changePassword(data: ChangePasswordDto, req: Request) {
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
    return { message: `Password changed successfully`, success: true };
  }
}
