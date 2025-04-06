import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PasswordService } from '@core/services/password/password.service';

import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let passwordService: PasswordService;

  const mockAuthRepository = {
    getUserByEmail: jest.fn(),
  };

  const mockPasswordService = {
    comparePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password',
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
        email: 'test@example.com',
        password: 'hashedPassword',
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

    it('should return true if credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'correctHashedPassword',
      };
      mockAuthRepository.getUserByEmail.mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(true);

      const result = await service.signIn(signInDto);
      expect(result).toBe(true);
      expect(authRepository.getUserByEmail).toHaveBeenCalledWith(signInDto);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
    });
  });
});
