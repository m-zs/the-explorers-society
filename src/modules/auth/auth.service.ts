import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PasswordService } from '@core/services/password/password.service';
import { RoleCacheService } from '@core/services/role-cache/role-cache.service';
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
    private readonly roleCacheService: RoleCacheService,
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

    const tokens = await this.getTokens(
      user.id,
      user.email,
      signInDto.tenantId,
    );
    return tokens;
  }

  async refreshTokens(
    userId: number,
    email: string,
    tenantId: number,
  ): Promise<InternalTokens> {
    return this.getTokens(userId, email, tenantId);
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
    tenantId: number,
  ): Promise<InternalTokens> {
    // Get user with their roles and tenant roles
    const userWithRoles =
      await this.usersService.getUserWithTenantsAndRoles(+userId);

    if (!userWithRoles) {
      throw new UnauthorizedException('User not found');
    }
    // Extract roles and tenant roles
    const userRoles = userWithRoles.roles || [];

    const roles: AppRole[] = userRoles
      .filter((role: RoleModel) => role.type === RoleType.GLOBAL)
      .map((role: RoleModel) => role.name as AppRole);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tenantId,
        },
        { secret: process.env.JWT_ACCESS_SECRET },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, tenantId },
        { secret: process.env.JWT_REFRESH_SECRET },
      ),
    ]);

    const tenantRoles = userWithRoles.roles.reduce(
      (acc, role) => {
        if (role.type === RoleType.TENANT) {
          if (!acc[role.tenantId]) {
            acc[role.tenantId] = [];
          }
          acc[role.tenantId].push(role.name);
        }
        return acc;
      },
      {} as Record<number, string[]>,
    );

    await Promise.all([
      ...Object.entries(tenantRoles).map(([tenantId, roles]) => {
        return this.roleCacheService.cacheUserRoles({
          userId,
          payload: {
            roles,
          },
          tenantId: +tenantId,
        });
      }),
      this.roleCacheService.cacheUserRoles({
        userId,
        payload: {
          roles,
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
