import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';

import { TenantRole } from '../enums/tenant-role.enum';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const TenantAuthGuard = (roles?: TenantRole[]) => {
  @Injectable()
  class TenantAuthGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      if (!roles) {
        return true;
      }

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      if (!user.tenantRoles) {
        throw new UnauthorizedException('User has no tenant roles');
      }

      return roles.some((role) => user.tenantRoles?.includes(role));
    }
  }

  return mixin(TenantAuthGuardMixin);
};
