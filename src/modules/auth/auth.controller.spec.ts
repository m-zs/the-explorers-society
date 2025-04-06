import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const validSignInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const invalidSignInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should return 200 OK with successful login', async () => {
      mockAuthService.signIn.mockResolvedValue(true);

      const result = await controller.signIn(validSignInDto);

      expect(result).toBe(true);
      expect(authService.signIn).toHaveBeenCalledWith(validSignInDto);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should return 401 Unauthorized for invalid credentials', async () => {
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      await expect(controller.signIn(invalidSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.signIn).toHaveBeenCalledWith(invalidSignInDto);
    });

    it('should pass complete SignInDto to auth service', async () => {
      const testDto: SignInDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      mockAuthService.signIn.mockResolvedValue(true);

      await controller.signIn(testDto);

      expect(authService.signIn).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testDto.email,
          password: testDto.password,
        }),
      );
    });
  });
});
