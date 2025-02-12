import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RolesController } from './roles.controller';
import { RoleRepository } from './roles.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [ConfigModule],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
})
export class RolesModule {}
