import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Apartment } from 'src/schemas/apartment.schema';
import { AuthenticatedRequest } from '../profile/profile.controller';
import { v2 as cloudinary } from 'cloudinary';
import { generateNumber } from 'src/helpers/generate-number';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectModel(Apartment.name) private apartmentModel: Model<Apartment>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  // -------------------- GET ALL --------------------- //
  async getApartments() {
    try {
      const allApartments = await this.apartmentModel
        .find({
          status: 'active',
        })
        .sort({ createdAt: -1 });
      return { message: 'Apartments', apartments: allApartments };
    } catch (error) {
      throw new console.log(error, 'get apartments 22');
    }
  }
  // -------------------- UPLOAD --------------------- //
  async createApartment(
    req: AuthenticatedRequest,
    details: any,
    images: Express.Multer.File[],
    location: any,
  ) {
    const info = JSON.parse(details);
    const phone = req?.user?.phone;

    const user = await this.userModel.findOne({ phone });
    if (!user)
      throw new UnauthorizedException('Incorrect password or phone number');

    const postId = generateNumber(12);
    const savedFiles: Array<{ url: string; publicId: string }> = [];

    for (const photo of images) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `users/${user?.user_id}/posts/${postId}`,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(photo.buffer);
      });
      savedFiles.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    }

    const newApartment = await this.apartmentModel.create({
      postId,
      address: info.address,
      orientiration: info.orientiration,
      price: info.price,
      rooms: info.rooms,
      type: info.type,
      for: info.for,
      amenities: info.amenities,
      images: savedFiles,
      location: { lat: location.lat, lng: location.lng },
      status: 'active',
      ownerId: user.user_id,
      phone: user?.phone,
      ownerName: user?.name,
    });

    return { message: 'Uploaded', success: true, data: newApartment };
  }
  // -------------------- GET ONE --------------------- //
  async getOneApartmen() {
    return { message: 'No scc' };
  }
}
