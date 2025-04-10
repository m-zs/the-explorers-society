import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PasswordService } from '@core/services/password/password.service';

import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { InternalTokens } from './interfaces/internal-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let passwordService: PasswordService;
  let jwtService: JwtService;

  const mockAuthRepository = {
    getUserByEmail: jest.fn(),
  };

  const mockPasswordService = {
    comparePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should throw UnauthorizedException if user is not found', async () => {
      mockAuthRepository.getUserByEmail.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.getUserByEmail).toHaveBeenCalledWith(signInDto);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: faker.number.int(),
        email: signInDto.email,
        password: faker.internet.password(),
      };
      mockAuthRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.getUserByEmail).toHaveBeenCalledWith(signInDto);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
    });

    it('should return tokens if credentials are valid', async () => {
      const mockUser = {
        id: faker.number.int(),
        email: signInDto.email,
        password: faker.internet.password(),
      };
      const mockTokens: InternalTokens = {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
      };
      mockAuthRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.signIn(signInDto);
      expect(result).toEqual(mockTokens);
      expect(authRepository.getUserByEmail).toHaveBeenCalledWith(signInDto);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshTokens', () => {
    it('should generate new tokens', async () => {
      const userId = faker.number.int();
      const email = faker.internet.email();
      const mockTokens: InternalTokens = {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
      };
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.refreshTokens(userId, email);
      expect(result).toEqual(mockTokens);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload if token is valid', async () => {
      const token = faker.string.alphanumeric(32);
      const mockPayload: JwtPayload = {
        sub: faker.number.int(),
        email: faker.internet.email(),
      };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyRefreshToken(token);
      expect(result).toEqual(mockPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = faker.string.alphanumeric(32);
      mockJwtService.verifyAsync.mockRejectedValue(new Error());

      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const token = faker.string.alphanumeric(32);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is malformed', async () => {
      const token = 'malformed.token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
