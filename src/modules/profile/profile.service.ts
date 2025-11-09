import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
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
  async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.user_id;
    const user = await this.authRepo.findByPhone(req.user.phone);

    const myApartmens = await this.apartmentModel.find({ ownerId: userId });

    const filteredUser = {
      id: userId,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
    };

    res.json({
      message: 'User information',
      success: true,
      user: filteredUser,
      myApartments: myApartmens,
    });
  }
  // ------------- CHANGE APARTMENT STATUS ------------- //
  async changeApartmentStatus(
    apartmentId: string,
    status: 'active' | 'archived',
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
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

      res.json({
        message: 'Status is changed',
        status: true,
        apartment: {
          id: apartmentId,
          title: myApartment.title,
          status: myApartment.status,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.log(error);
    }
  }
  async removeApartment(
    apartmentId: string,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const userId = req.user.user_id;
      const myApartment = await this.apartmentModel.findOne({
        ownerId: userId,
        _id: apartmentId,
      });

      if (!myApartment)
        throw new BadRequestException(`You don't have any apartment`);

      await myApartment.deleteOne();

      res.json({
        message: 'Apartment deleted successfully',
        status: true,
        apartmentId,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.log(error);
    }
  }

  // ---------------- CHANGE  PASSWORD ----------------- //
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
    res.json({ message: `Password changed successfully`, success: true });
  }
}
