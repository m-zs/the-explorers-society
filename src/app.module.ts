import { BullModule } from '@nestjs/bullmq';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { DatabaseModule } from '@core/database/database.module';
import { UniqueViolationExceptionFilter } from '@core/filters/unique-violation-exception.filter';
import { LogService } from '@core/logging/log.service';
import { RedisModule } from '@core/redis/redis.module';
import { PasswordService } from '@core/services/password/password.service';
import { RoleCacheProcessor } from '@core/services/role-cache/role-cache.processor';
import { exceptionFactory } from '@core/validation/exception.factory';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { env } from '../env';
import { TenantMiddleware } from './core/middleware/tenant.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: env,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    { global: true, module: RoleCacheProcessor },
    DatabaseModule,
    RedisModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    AuthModule,
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
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(), TenantMiddleware).forRoutes('*');
  }
}
