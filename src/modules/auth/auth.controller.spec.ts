import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { RoleCacheService } from '@core/services/role-cache/role-cache.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { AppRole } from './enums/app-role.enum';
import { AuthGuard } from './guards/auth.guard';

const mockAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    refreshTokens: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockRoleCacheService = {
    getRolePermissions: jest.fn(),
    cacheUserRoles: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    req: {
      cookies: {},
      user: {
        roles: [AppRole.USER],
        tenantRoles: [],
      },
    },
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RoleCacheService,
          useValue: mockRoleCacheService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const validSignInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      tenantId: faker.number.int(),
    };

    const invalidSignInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      tenantId: faker.number.int(),
    };

    it('should return access token and set refresh token cookie on successful login', async () => {
      const mockTokens: TokenResponseDto = {
        accessToken: faker.string.alphanumeric(32),
      };
      const refreshToken = faker.string.alphanumeric(32);
      mockAuthService.signIn.mockResolvedValue({
        accessToken: mockTokens.accessToken,
        refreshToken,
      });

      const result = await controller.signIn(validSignInDto, mockResponse);

      expect(result).toEqual(mockTokens);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        refreshToken,
        expect.any(Object),
      );
      expect(authService.signIn).toHaveBeenCalledWith(validSignInDto);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.signIn(invalidSignInDto, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.signIn).toHaveBeenCalledWith(invalidSignInDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should pass complete SignInDto to auth service', async () => {
      const testDto: SignInDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        tenantId: faker.number.int(),
      };

      mockAuthService.signIn.mockResolvedValue({
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
      });

      await controller.signIn(testDto, mockResponse);

      expect(authService.signIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testDto.email,
          password: testDto.password,
          tenantId: testDto.tenantId,
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens and set new refresh token cookie', async () => {
      const mockTokens: TokenResponseDto = {
        accessToken: faker.string.alphanumeric(32),
      };
      const userId = faker.number.int();
      const email = faker.internet.email();
      const tenantId = faker.number.int();
      const oldRefreshToken = faker.string.alphanumeric(32);
      const newRefreshToken = faker.string.alphanumeric(32);

      mockAuthService.verifyRefreshToken.mockResolvedValue({
        sub: userId.toString(),
        email,
        tenantId,
      });
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: mockTokens.accessToken,
        refreshToken: newRefreshToken,
      });

      mockResponse.req.cookies = {
        refresh_token: oldRefreshToken,
      };

      const result = await controller.refreshTokens(mockResponse);

      expect(result).toEqual(mockTokens);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        newRefreshToken,
        expect.any(Object),
      );
      expect(authService.verifyRefreshToken).toHaveBeenCalledWith(
        oldRefreshToken,
      );
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        userId,
        email,
        tenantId,
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const invalidToken = faker.string.alphanumeric(32);
      mockResponse.req.cookies = {
        refresh_token: invalidToken,
      };
      mockAuthService.verifyRefreshToken.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(controller.refreshTokens(mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(authService.verifyRefreshToken).toHaveBeenCalledWith(invalidToken);
      expect(authService.refreshTokens).not.toHaveBeenCalled();
    });
  });
});
