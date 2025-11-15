import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../profile/profile.controller';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(AccessTokenGuard)
@Controller('apartments')
export class ApartmentsController {
  constructor(private apartmentsService: ApartmentsService) {}
  // -------------------- GET ALL --------------------- //
  @Get('')
  async getApartments(@Res() res: Response) {
    return await this.apartmentsService.getApartments(res);
  }
  // -------------------- UPLOAD --------------------- //
  @Post('upload')
  @UseInterceptors(FilesInterceptor('photos'))
  async createApartment(
    @Req() req: AuthenticatedRequest,
    // @Body('details') details: any,
    @UploadedFiles() photos: Express.Multer.File[],
    // @Body('location') location: any,
    // @Res()
    // res: Response,
  ) {
    return await this.apartmentsService.createApartment(
      req,
      // details,
      photos,
      // location,
    );
  }
  // -------------------- GET ONE --------------------- //
  @Post(':id')
  async getOneApartmen(@Res() res: Response) {
    return await this.apartmentsService.getOneApartmen(res);
  }
}
