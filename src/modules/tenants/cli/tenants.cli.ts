import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { TenantsSeedCommand } from './tenants-seeder.command';
import { DatabaseModule } from '../../../core/database/database.module';
import { TenantRepository } from '../tenants.repository';

@Module({
  imports: [DatabaseModule],
  providers: [TenantsSeedCommand, TenantRepository],
})
export class CliModule {}

async function bootstrap() {
  await CommandFactory.run(CliModule, ['warn', 'error']);
}

void bootstrap();
