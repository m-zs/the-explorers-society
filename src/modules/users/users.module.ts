import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PasswordService } from '@core/services/password/password.service';

import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule],
  controllers: [UsersController],
  providers: [PasswordService, UserRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
