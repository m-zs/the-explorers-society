import { faker } from '@faker-js/faker';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
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

    it('should return true if token is valid', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
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

    it('should attach payload to request if token is valid', async () => {
      const payload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
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

      await guard.canActivate(context);
      expect(request['user']).toEqual(payload);
    });
  });
});
