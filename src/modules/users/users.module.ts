import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PasswordService } from '@core/services/password/password.service';
import { TenantsModule } from '@modules/tenants/tenants.module';

import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, TenantsModule],
  controllers: [UsersController],
  providers: [PasswordService, UserRepository, UsersService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
