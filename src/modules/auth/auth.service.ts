import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PasswordService } from '@core/services/password/password.service';
import { RoleModel } from '@modules/roles/models/role.model';
import { RoleType } from '@modules/users/role.enum';
import { UserRepository } from '@modules/users/users.repository';
import { UsersService } from '@modules/users/users.service';

import { SignInDto } from './dto/sign-in.dto';
import { AppRole } from './enums/app-role.enum';
import { InternalTokens } from './interfaces/internal-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<InternalTokens> {
    const user = await this.usersRepository.getUserByEmail(signInDto.email);

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
    // Get user with their roles and tenant roles
    const userWithRoles =
      await this.usersService.getUserWithTenantsAndRoles(+userId);

    if (!userWithRoles) {
      throw new UnauthorizedException('User not found');
    }
    // Extract roles and tenant roles
    const userRoles = userWithRoles.roles || [];

    const roles: AppRole[] = userRoles.map(
      (role: RoleModel) => role.name as AppRole,
    );

    const tenantRoles: string[] = userRoles
      .filter((role: RoleModel) => role.type === RoleType.TENANT)
      .map((role: RoleModel) => role.name);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          roles,
          tenantRoles,
        },
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
