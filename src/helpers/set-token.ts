import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export const setToken = (
  token: string,
  maxAge: number,
  type: 'access' | 'refresh' | 'reset_password',
  configService: ConfigService,
  res: Response,
) => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  res.cookie(`${type}_token`, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: maxAge,
  });
};
