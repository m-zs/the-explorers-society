import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { DatabaseModule } from '@core/database/database.module';
import { UniqueViolationExceptionFilter } from '@core/filters/unique-violation-exception.filter';
import { LogService } from '@core/logging/log.service';
import { PasswordService } from '@core/services/password/password.service';
import { exceptionFactory } from '@core/validation/exception.factory';
import { RolesModule } from '@modules/roles/roles.module';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { UsersModule } from '@modules/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { env } from '../env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: env,
    }),

    DatabaseModule,
    TenantsModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: UniqueViolationExceptionFilter,
    },
    AppService,
    LogService,
    PasswordService,
  ],
  exports: [PasswordService],
})
export class AppModule {}
