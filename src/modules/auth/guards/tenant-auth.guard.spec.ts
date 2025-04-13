import { faker } from '@faker-js/faker';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { TenantAuthGuard } from './tenant-auth.guard';
import { TenantRole } from '../enums/tenant-role.enum';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

describe('TenantAuthGuard', () => {
  let guard: CanActivate;

  beforeEach(() => {
    const GuardClass = TenantAuthGuard([TenantRole.ADMIN]);
    guard = new GuardClass();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles required', () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
          tenantRoles: [TenantRole.USER],
        },
      } as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      const NoRolesGuardClass = TenantAuthGuard();
      const noRolesGuard = new NoRolesGuardClass();
      const result = noRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user is not authenticated', () => {
      const request = {} as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no tenant roles', () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
        },
      } as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if user has empty tenant roles array', () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
          tenantRoles: [] as TenantRole[],
        },
      } as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true if user has required tenant role', () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
          tenantRoles: [TenantRole.ADMIN],
        },
      } as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has one of the required tenant roles', () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
          tenantRoles: [TenantRole.SUPPORT],
        },
      } as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      const MultipleRolesGuardClass = TenantAuthGuard([
        TenantRole.ADMIN,
        TenantRole.SUPPORT,
      ]);
      const multipleRolesGuard = new MultipleRolesGuardClass();
      const result = multipleRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not have required tenant role', () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
          tenantRoles: [TenantRole.USER],
        },
      } as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
