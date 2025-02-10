import { Module } from '@nestjs/common';

import { PasswordService } from '@core/services/password/password.service';

import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [PasswordService, UserRepository, UsersService],
})
export class UsersModule {}
