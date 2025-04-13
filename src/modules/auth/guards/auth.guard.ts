import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppRole } from '../enums/app-role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const AuthGuard = (requiredRoles?: AppRole[]) => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(public jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });

        request.user = {
          ...payload,
          tenantRoles: payload.tenantRoles || [],
          roles: payload.roles || [],
        };

        if (!requiredRoles) {
          return true;
        }
        return requiredRoles.some((role) => payload.roles?.includes(role));
      } catch {
        throw new UnauthorizedException('Invalid token');
      }
    }

    extractTokenFromHeader(request: RequestWithUser): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(AuthGuardMixin);
};
