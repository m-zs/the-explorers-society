import { faker } from '@faker-js/faker';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { RoleCacheService } from '@core/services/role-cache/role-cache.service';

import { TenantAuthGuard } from './tenant-auth.guard';
import { TenantRole } from '../enums/tenant-role.enum';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

describe('TenantAuthGuard', () => {
  let guard: CanActivate;
  let roleCacheService: RoleCacheService;

  beforeEach(() => {
    roleCacheService = {
      getCachedRoles: jest.fn().mockResolvedValue({
        roles: [TenantRole.ADMIN],
      }),
    } as unknown as RoleCacheService;
    const GuardClass = TenantAuthGuard([TenantRole.ADMIN]);
    guard = new GuardClass(roleCacheService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles required', async () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
        },
        tenantId: faker.string.uuid(),
        cookies: {},
        signedCookies: {},
        get: jest.fn(),
      } as unknown as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      const NoRolesGuardClass = TenantAuthGuard();
      const noRolesGuard = new NoRolesGuardClass(roleCacheService);
      const result = await noRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const request = {
        tenantId: faker.string.uuid(),
        cookies: {},
        signedCookies: {},
        get: jest.fn(),
      } as unknown as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user has no tenant roles', async () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
        },
        tenantId: faker.string.uuid(),
        cookies: {},
        signedCookies: {},
        get: jest.fn(),
      } as unknown as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      (roleCacheService.getCachedRoles as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user does not have required tenant role', async () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
        },
        tenantId: faker.string.uuid(),
        cookies: {},
        signedCookies: {},
        get: jest.fn(),
      } as unknown as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      (roleCacheService.getCachedRoles as jest.Mock).mockResolvedValueOnce({
        roles: [TenantRole.USER],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return true if user has required tenant role', async () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
        },
        tenantId: faker.string.uuid(),
        cookies: {},
        signedCookies: {},
        get: jest.fn(),
      } as unknown as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      (roleCacheService.getCachedRoles as jest.Mock).mockResolvedValueOnce({
        roles: [TenantRole.ADMIN],
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has one of the required tenant roles', async () => {
      const request = {
        user: {
          sub: faker.string.uuid(),
          email: faker.internet.email(),
          tenantId: faker.string.uuid(),
        },
        tenantId: faker.string.uuid(),
        cookies: {},
        signedCookies: {},
        get: jest.fn(),
      } as unknown as RequestWithUser;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      (roleCacheService.getCachedRoles as jest.Mock).mockResolvedValueOnce({
        roles: [TenantRole.SUPPORT],
      });

      const MultipleRolesGuardClass = TenantAuthGuard([
        TenantRole.ADMIN,
        TenantRole.SUPPORT,
      ]);
      const multipleRolesGuard = new MultipleRolesGuardClass(roleCacheService);
      const result = await multipleRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
