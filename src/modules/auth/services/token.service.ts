import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}
  async generateTokens(user_id: string, phone: string) {
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
    const accessExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');

    const access_token = await this.jwtService.signAsync(
      { user_id, phone },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      },
    );
    const refresh_token = await this.jwtService.signAsync(
      { user_id, phone },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      },
    );
    return { access_token, refresh_token };
  }
  async generateResetToken(user_id: string, phone: string) {
    const resetSecret = this.configService.get('JWT_RESET_SECRET');
    const resetExpiresIn = this.configService.get('JWT_RESET_EXPIRES_IN');

    const token = await this.jwtService.signAsync(
      { user_id, phone },
      {
        secret: resetSecret,
        expiresIn: resetExpiresIn,
      },
    );

    return token;
  }
  async verifyToken(
    token: string,
    type: 'access' | 'refresh' | 'reset_password',
  ) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>(
          type === 'access'
            ? 'JWT_ACCESS_SECRET'
            : type === 'refresh'
              ? 'JWT_REFRESH_SECRET'
              : type === 'reset_password'
                ? 'JWT_RESET_SECRET'
                : '',
        ),
      });

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      console.log(error);
      

      // Токен жалған, криптография жылап тұр
      throw new UnauthorizedException('Invalid token');
    }
  }
}
