import { Response } from 'express';

export const setToken = (
  token: string,
  maxAge: number,
  type: 'access' | 'refresh' | 'reset_password',
  res: Response,
) => {
  res.cookie(`${type}_token`, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: maxAge,
  });
};
