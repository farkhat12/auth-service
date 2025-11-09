import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApartmentsService } from './apartments.service';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../profile/profile.controller';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

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
  async createApartment(
    @Req() req: AuthenticatedRequest,
    @Body() body: any,
    @Res() res: Response,
  ) {
    return await this.apartmentsService.createApartment(req, body, res);
  }
  // -------------------- GET ONE --------------------- //
  @Post(':id')
  async getOneApartmen(@Res() res: Response) {
    return await this.apartmentsService.getOneApartmen(res);
  }
}
