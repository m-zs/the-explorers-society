import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PasswordService } from '@core/services/password/password.service';

import { AuthRepository } from './auth.repository';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<boolean> {
    const user = await this.authRepository.getUserByEmail(signInDto);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      signInDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
