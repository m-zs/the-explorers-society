import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UserRepository, UsersService],
})
export class UsersModule {}
