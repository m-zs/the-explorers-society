import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PasswordService } from '@core/services/password/password.service';
import { UserRepository } from '@modules/users/users.repository';
import { UsersService } from '@modules/users/users.service';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { InternalTokens } from './interfaces/internal-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockUserRepository = {
    getUserByEmail: jest.fn(),
  };

  const mockPasswordService = {
    comparePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockUsersService = {
    getUserWithTenantsAndRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: faker.number.int(),
        email: signInDto.email,
        password: faker.internet.password(),
      };
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
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
      const mockUserWithRoles = {
        ...mockUser,
        roles: [{ name: 'USER', type: 'APP' }],
      };
      const mockTokens: InternalTokens = {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
      };
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockUsersService.getUserWithTenantsAndRoles.mockResolvedValue(
        mockUserWithRoles,
      );
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.signIn(signInDto);
      expect(result).toEqual(mockTokens);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(usersService.getUserWithTenantsAndRoles).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshTokens', () => {
    it('should generate new tokens', async () => {
      const userId = faker.number.int();
      const email = faker.internet.email();
      const mockUserWithRoles = {
        id: userId,
        email,
        roles: [{ name: 'USER', type: 'APP' }],
      };
      const mockTokens: InternalTokens = {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
      };
      mockUsersService.getUserWithTenantsAndRoles.mockResolvedValue(
        mockUserWithRoles,
      );
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.refreshTokens(userId, email);
      expect(result).toEqual(mockTokens);
      expect(usersService.getUserWithTenantsAndRoles).toHaveBeenCalledWith(
        userId,
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload if token is valid', async () => {
      const token = faker.string.alphanumeric(32);
      const mockPayload: JwtPayload = {
        sub: faker.string.uuid(),
        email: faker.internet.email(),
        tenantId: faker.string.uuid(),
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
