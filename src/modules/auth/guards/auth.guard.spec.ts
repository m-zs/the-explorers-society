import { faker } from '@faker-js/faker';
import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { AuthGuard } from './auth.guard';
import { AppRole } from '../enums/app-role.enum';

describe('AuthGuard', () => {
  let guard: CanActivate;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    const GuardClass = AuthGuard([AppRole.ADMIN]);
    guard = new GuardClass(jwtService);
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
        roles: [AppRole.USER],
        tenantRoles: [],
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

      const NoRolesGuardClass = AuthGuard();
      const noRolesGuard = new NoRolesGuardClass(jwtService);
      const result = await noRolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has required app role', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        roles: [AppRole.ADMIN],
        tenantRoles: [],
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

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return false if user does not have required app role', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        roles: [AppRole.USER],
        tenantRoles: [],
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

      const result = await guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should attach payload to request if token is valid', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        roles: [AppRole.USER],
        tenantRoles: [],
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

      const NoRolesGuardClass = AuthGuard();
      const noRolesGuard = new NoRolesGuardClass(jwtService);
      await noRolesGuard.canActivate(context);
      expect(request['user']).toEqual({
        ...payload,
        tenantRoles: [],
        roles: [AppRole.USER],
      });
    });
  });
});
