import { CookieOptions } from 'express';

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: parseInt(
    process.env.JWT_REFRESH_EXPIRATION ?? String(SEVEN_DAYS_IN_MS),
  ),
};
