import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RoleCacheService } from '@core/services/role-cache/role-cache.service';

import { AppRole } from '../enums/app-role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const AuthGuard = (requiredRoles?: AppRole[]) => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(
      public jwtService: JwtService,
      public roleCacheService: RoleCacheService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      let payload: JwtPayload;
      try {
        payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
      } catch {
        throw new UnauthorizedException('Invalid token');
      }

      const roleData = await this.roleCacheService.getCachedRoles(+payload.sub);

      request.user = {
        ...payload,
        roles: (roleData?.roles as AppRole[]) || [],
      };

      if (!requiredRoles) {
        return true;
      }

      if (!requiredRoles.some((role) => roleData?.roles.includes(role))) {
        throw new ForbiddenException(
          `You don't have app level required access level: ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    }

    extractTokenFromHeader(request: RequestWithUser): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(AuthGuardMixin);
};
