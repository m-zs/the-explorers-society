import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { REFRESH_TOKEN_COOKIE_NAME } from '../constants/cookie-options.constant';
import { RequestWithCookies } from '../interfaces/request-with-cookies.interface';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCookies>();
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    return true;
  }
}
