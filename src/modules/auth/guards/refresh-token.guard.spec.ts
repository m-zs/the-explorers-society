import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RefreshTokenGuard } from './refresh-token.guard';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants/cookie-options.constant';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenGuard],
    }).compile();

    guard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no refresh token is provided', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should return true when refresh token is provided', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {
            [REFRESH_TOKEN_COOKIE_NAME]: 'valid-refresh-token',
          },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
