import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { Apartment } from 'src/schemas/apartment.schema';
import { AuthenticatedRequest } from '../profile/profile.controller';

@Injectable()
export class ApartmentsService {
  constructor(
    @InjectModel(Apartment.name) private apartmentModel: Model<Apartment>,
  ) {}
  // -------------------- GET ALL --------------------- //
  async getApartments(res: Response) {
    const allApartments = await this.apartmentModel.find({});
    console.log(allApartments);

    res.json({ message: 'Apartments', apartments: allApartments });
  }
  // -------------------- UPLOAD --------------------- //
  async createApartment(
    req: AuthenticatedRequest,
    // body: any,
    photos: Express.Multer.File[],
    // location: any,
    // res: Response,
  ) {
    const userId = req.user.user_id;
    console.log(photos);
    // console.log(location);


    // const createdApartment = await this.apartmentModel.create({
    //   ...body,
    //   ownerId: userId,
    // });

    // res.json({ message: 'Uploaded' });
  }
  // -------------------- GET ONE --------------------- //
  async getOneApartmen(res: Response) {
    res.json({ message: 'No scc' });
  }
}
