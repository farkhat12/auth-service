import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');
    try {
      const decoded = this.tokenService.verifyToken(refreshToken, 'refresh');
      (req as any).user = decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return true;
  }
}
