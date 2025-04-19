import { faker } from '@faker-js/faker';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { RoleCacheService } from '@core/services/role-cache/role-cache.service';

import { AuthGuard } from './auth.guard';
import { AppRole } from '../enums/app-role.enum';

describe('AuthGuard', () => {
  let guard: CanActivate;
  let jwtService: JwtService;
  let roleCacheService: RoleCacheService;

  const mockRoleCacheService = {
    getUserCachedRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: RoleCacheService,
          useValue: mockRoleCacheService,
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    roleCacheService = module.get<RoleCacheService>(RoleCacheService);
    const GuardClass = AuthGuard([AppRole.ADMIN]);
    guard = new GuardClass(jwtService, roleCacheService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token format is invalid', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'InvalidTokenFormat',
            },
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const invalidToken = faker.string.alphanumeric(32);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${invalidToken}`,
            },
          }),
        }),
      } as ExecutionContext;

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true if token is valid and no roles required', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        tenantId: faker.number.int(),
      };
      const validToken = faker.string.alphanumeric(32);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${validToken}`,
            },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      mockRoleCacheService.getUserCachedRoles.mockResolvedValueOnce({
        roles: [AppRole.USER],
        tenantRoles: {},
      });

      const NoRolesGuardClass = AuthGuard();
      const noRolesGuard = new NoRolesGuardClass(jwtService, roleCacheService);
      const result = await noRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has required app role', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        tenantId: faker.number.int(),
      };
      const validToken = faker.string.alphanumeric(32);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${validToken}`,
            },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      mockRoleCacheService.getUserCachedRoles.mockResolvedValueOnce({
        roles: [AppRole.ADMIN],
        tenantRoles: {},
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has one of the required app roles', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        tenantId: faker.number.int(),
      };
      const validToken = faker.string.alphanumeric(32);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${validToken}`,
            },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      mockRoleCacheService.getUserCachedRoles.mockResolvedValueOnce({
        roles: [AppRole.SUPPORT],
        tenantRoles: {},
      });

      const MultipleRolesGuardClass = AuthGuard([
        AppRole.ADMIN,
        AppRole.SUPPORT,
      ]);
      const multipleRolesGuard = new MultipleRolesGuardClass(
        jwtService,
        roleCacheService,
      );
      const result = await multipleRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not have required app role', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        tenantId: faker.number.int(),
      };
      const validToken = faker.string.alphanumeric(32);
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${validToken}`,
            },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      mockRoleCacheService.getUserCachedRoles.mockResolvedValueOnce({
        roles: [AppRole.USER],
        tenantRoles: {},
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should attach payload to request if token is valid', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        tenantId: faker.number.int(),
      };
      const validToken = faker.string.alphanumeric(32);
      const request = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      } as Request;

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      mockRoleCacheService.getUserCachedRoles.mockResolvedValueOnce({
        roles: [AppRole.USER],
      });

      const NoRolesGuardClass = AuthGuard();
      const noRolesGuard = new NoRolesGuardClass(jwtService, roleCacheService);
      await noRolesGuard.canActivate(context);
      expect(request['user']).toEqual({
        ...payload,
        roles: [AppRole.USER],
      });
    });
  });
});
