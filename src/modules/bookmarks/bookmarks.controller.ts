import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

export interface AuthenticatedRequest extends Request {
  user: {
    user_id: number;
    phone: string;
  };
}

@UseGuards(AccessTokenGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}
  // -------------------- GET ALL --------------------- //
  @Get()
  async getBookmarks(@Req() req: AuthenticatedRequest) {
    return await this.bookmarksService.getBookmarks(req);
  }
  // ----------------- ADD BOOKMARK ------------------- //
  @Post(':apartmentId')
  async addBookmark(
    @Param('apartmentId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.bookmarksService.addBookmark(id, req.user.user_id);
  }
  // ---------------- REMOVE BOOKMARK ------------------ //
  @Delete(':apartmentId')
  async removeBookmark(
    @Param('apartmentId') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.bookmarksService.removeBookmark(id, req?.user?.user_id);
  }
}
