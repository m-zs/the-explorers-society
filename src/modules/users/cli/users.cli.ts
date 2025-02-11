import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { UsersSeedCommand } from './users-seeder.command';
import { DatabaseModule } from '../../../core/database/database.module';
import { UsersModule } from '../users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [UsersModule, UsersSeedCommand],
})
export class CliModule {}

async function bootstrap() {
  await CommandFactory.run(CliModule, ['warn', 'error']);
}

void bootstrap();
