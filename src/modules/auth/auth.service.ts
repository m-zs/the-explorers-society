import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PasswordService } from '@core/services/password/password.service';

import { AuthRepository } from './auth.repository';
import { SignInDto } from './dto/sign-in.dto';
import { InternalTokens } from './interfaces/internal-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<InternalTokens> {
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

    const tokens = await this.getTokens(user.id, user.email);
    return tokens;
  }

  async refreshTokens(userId: number, email: string): Promise<InternalTokens> {
    return this.getTokens(userId, email);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async getTokens(
    userId: number,
    email: string,
  ): Promise<InternalTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_ACCESS_SECRET },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
