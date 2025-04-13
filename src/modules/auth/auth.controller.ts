import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from './constants/cookie-options.constant';
import { SignInDto } from './dto/sign-in.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { AppRole } from './enums/app-role.enum';
import { AuthGuard } from './guards/auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RequestWithCookies } from './interfaces/request-with-cookies.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TokenResponseDto,
    description: 'Successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh Access Token' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TokenResponseDto,
    description: 'Successfully refreshed tokens',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing refresh token',
  })
  async refreshTokens(
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponseDto> {
    const refreshToken = (res.req as RequestWithCookies).cookies[
      REFRESH_TOKEN_COOKIE_NAME
    ]!;
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(Number(payload.sub), payload.email);

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      newRefreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Logout' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
  })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: 0,
    });
  }

  @Get('auth-test')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auth passed',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing refresh token',
  })
  @UseGuards(AuthGuard([AppRole.USER]))
  test() {
    return;
  }
}
