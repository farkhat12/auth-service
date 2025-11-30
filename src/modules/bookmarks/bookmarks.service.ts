import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from './bookmarks.controller';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Apartment, ApartmentDocument } from 'src/schemas/apartment.schema';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Apartment.name)
    private apartmentModel: Model<ApartmentDocument>,
  ) {}
  // ----------------- GET ALL ------------------- //
  async getBookmarks(req: AuthenticatedRequest) {
    try {
      const userId = req?.user.user_id;
      const user = await this.userModel.findOne({ user_id: userId });
      if (!user) throw new BadRequestException('hWEKND');

      const bookmarks = await this.apartmentModel.find({
        status: 'active',
        _id: { $in: user.bookmarks.map((id) => new Types.ObjectId(id)) },
      });

      return {
        message: 'Your bookmarks',
        success: true,
        bookmarks: bookmarks,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Unexpected error');
    }
  }
  // ----------------- ADD BOOKMARK ------------------- //
  async addBookmark(apartmentId: string, user_id: number) {
    try {
      const apartment = await this.apartmentModel.findById(apartmentId);
      if (!apartment) throw new NotFoundException('Apartment not found');

      const user = await this.userModel
        .findOne({ user_id })
        .select('name phone bookmarks user_id');
      if (!user) throw new NotFoundException('User not found');

      const isExist = user.bookmarks.some(
        (apartment) => apartment.toString() === apartmentId,
      );
      if (isExist) throw new ConflictException('Already bookmarked');

      user.bookmarks.unshift(new Types.ObjectId(apartmentId));
      await user.save();

      const updated = await user.populate({
        path: 'bookmarks',
        select: 'title price photos location',
      });
      return {
        message: 'Bookmark added successfully',
        success: true,
        user: {
          name: updated.name,
          phone: updated.phone,
          user_id: updated.user_id,
        },
        bookmarks: updated.bookmarks,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Unexpected error');
    }
  }
  // ---------------- REMOVE BOOKMARK ------------------ //
  async removeBookmark(apartmentId: string, user_id: number) {
    try {
      const apartment = await this.apartmentModel.findById(apartmentId);
      if (!apartment) throw new NotFoundException('Apartment not found');

      const user = await this.userModel
        .findOne({ user_id })
        .select('name phone bookmarks user_id');
      if (!user) throw new NotFoundException('User not found');

      const isExist = user.bookmarks.some(
        (apartment) => apartment.toString() === apartmentId,
      );
      if (!isExist) throw new ConflictException('Not bookmarked');

      await this.userModel.updateOne(
        { user_id },
        { $pull: { bookmarks: new Types.ObjectId(apartmentId) } },
      );

      const updated = await user.populate({
        path: 'bookmarks',
        select: 'title price photos location',
      });

      return {
        message: 'Bookmark removed successfully',
        success: true,
        user: {
          name: updated.name,
          phone: updated.phone,
          user_id: updated.user_id,
        },
        bookmarks: updated.bookmarks,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Unexpected error');
    }
  }
}
