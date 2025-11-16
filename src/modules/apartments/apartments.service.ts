import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { Apartment } from 'src/schemas/apartment.schema';
import { AuthenticatedRequest } from '../profile/profile.controller';
import { v2 as cloudinary } from 'cloudinary';
import { generateNumber } from 'src/helpers/generate-number';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectModel(Apartment.name) private apartmentModel: Model<Apartment>,
  ) {}
  // -------------------- GET ALL --------------------- //
  async getApartments(res: Response) {
    const allApartments = await this.apartmentModel.find({});

    res.json({ message: 'Apartments', apartments: allApartments });
  }
  // -------------------- UPLOAD --------------------- //

  async createApartment(
    req: AuthenticatedRequest,
    details: any,
    photos: Express.Multer.File[],
    location: any,
    res: Response,
  ) {
    const info = JSON.parse(details);
    const userId = req.user.user_id;
    const postId = generateNumber(12);
    const savedFiles: Array<{ url: string; publicId: string }> = [];
    for (const photo of photos) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `users/${userId}/posts/${postId}`,
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
      ownerId: userId,
    });

    return savedFiles;
  }
  // -------------------- GET ONE --------------------- //
  async getOneApartmen(res: Response) {
    res.json({ message: 'No scc' });
  }
}
