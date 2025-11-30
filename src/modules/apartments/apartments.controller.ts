import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { AuthenticatedRequest } from '../profile/profile.controller';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('apartments')
export class ApartmentsController {
  constructor(private apartmentsService: ApartmentsService) {}
  // -------------------- GET ALL --------------------- //
  @Get('')
  async getApartments() {
    return await this.apartmentsService.getApartments();
  }
  // --------------------- UPLOAD --------------------- //
  @UseGuards(AccessTokenGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('images'))
  async createApartment(
    @Req() req: AuthenticatedRequest,
    @Body('details') details: any,
    @UploadedFiles() images: Express.Multer.File[],
    @Body('location') location: any,
  ) {
    return await this.apartmentsService.createApartment(
      req,
      details,
      images,
      location,
    );
  }
  // -------------------- GET ONE --------------------- //
  @Post(':id')
  async getOneApartmen() {
    return await this.apartmentsService.getOneApartmen();
  }
}
