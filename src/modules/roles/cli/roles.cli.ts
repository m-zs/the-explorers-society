import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { DatabaseModule } from '@core/database/database.module';
import { RolesModule } from '@modules/roles/roles.module';

import { RolesSeedCommand } from './roles-seeder.command';

@Module({
  imports: [DatabaseModule, RolesModule],
  providers: [RolesModule, RolesSeedCommand],
})
export class CliModule {}

async function bootstrap() {
  await CommandFactory.run(CliModule, ['warn', 'error']);
}

void bootstrap();
