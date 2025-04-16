import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';

import { RoleCacheService } from '@core/services/role-cache/role-cache.service';

import { TenantRole } from '../enums/tenant-role.enum';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const TenantAuthGuard = (roles?: TenantRole[]) => {
  @Injectable()
  class TenantAuthGuardMixin implements CanActivate {
    constructor(public roleCacheService: RoleCacheService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!roles) {
        return true;
      }

      const request = context.switchToHttp().getRequest<RequestWithUser>();

      if (!request.user) {
        throw new UnauthorizedException('User not authenticated');
      }

      const roleData = await this.roleCacheService.getCachedRoles(
        +request.user.sub,
        request.tenantId,
      );

      request.user = {
        ...request.user,
        tenantRoles: roleData?.roles as TenantRole[] | undefined,
      };

      if (!request.user.tenantRoles) {
        throw new UnauthorizedException('User has no tenant roles');
      }

      if (!roles.some((role) => request.user.tenantRoles?.includes(role))) {
        throw new ForbiddenException(
          `You don't have tenant level required access level: ${roles.join(', ')}`,
        );
      }

      return true;
    }
  }

  return mixin(TenantAuthGuardMixin);
};
