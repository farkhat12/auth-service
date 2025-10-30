import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { generateNumber } from 'src/helpers/generate-number';
import { RedisClientType } from 'redis';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepo {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('REDIS_CLIENT') private redis: RedisClientType,
  ) {}
  async checkPhone(phone: string) {
    const user = await this.userModel.findOne({ phone });
    if (user) throw new ConflictException('Phone number already exist');
  }
  async findByPhone(phone: string) {
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async createUser(data: any) {
    if (!data.password) throw new BadRequestException('Password not found');
    const hashedPassword = await bcrypt.hash(data.password, 9);
    try {
      const userId = generateNumber(9);
      const newUser = {
        name: data.name,
        user_id: userId,
        phone: data.phone,
        password: hashedPassword,
      };
      await this.redis.set(`temp_user:${data.phone}`, JSON.stringify(newUser), {
        EX: 60 * 10,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong',
        error: error.message,
      });
    }
  }
  async updatePassword(phone: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 9);
      return await this.userModel.updateOne(
        { phone },
        { $set: { password: hashedPassword } },
      );
    } catch (error) {
      throw new BadRequestException("Password didn't change");
    }
  }
}
