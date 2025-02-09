import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@core/database/database.module';
import { LogService } from '@core/logging/log.service';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { UsersModule } from '@modules/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),

    DatabaseModule,
    TenantsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, LogService],
})
export class AppModule {}
