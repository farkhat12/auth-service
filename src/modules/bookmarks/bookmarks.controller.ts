import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

@UseGuards(AccessTokenGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}
  // -------------------- GET ALL --------------------- //
  @Get()
  async getBookmarks(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    return await this.bookmarksService.getBookmarks(req, res);
  }
  // ----------------- ADD BOOKMARK ------------------- //
  @Post(':apartmentId')
  async addBookmark(
    @Param('apartmentId') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    return await this.bookmarksService.addBookmark(id, req?.user?.user_id, res);
  }
  // ---------------- REMOVE BOOKMARK ------------------ //
  @Delete(':apartmentId')
  async removeBookmark(
    @Param('apartmentId') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    return await this.bookmarksService.removeBookmark(
      id,
      req?.user?.user_id,
      res,
    );
  }
}
