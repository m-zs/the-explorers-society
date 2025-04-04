import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PasswordService } from '@core/services/password/password.service';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtService, PasswordService],
})
export class AuthModule {}
