import { Module } from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Apartment, ApartmentSchema } from 'src/schemas/apartment.schema';
import { TokenService } from '../auth/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';

@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    MongooseModule.forFeature([
      { name: Apartment.name, schema: ApartmentSchema },
    ]),
  ],
  controllers: [ApartmentsController],
  providers: [ApartmentsService, TokenService, JwtService],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
