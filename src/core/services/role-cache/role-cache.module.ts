import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisModule } from '@core/redis/redis.module';

import { RoleCacheProcessor } from './role-cache.processor';
import { RoleCacheService } from './role-cache.service';

@Module({
  imports: [
    RedisModule,
    BullModule.registerQueueAsync({
      name: 'role-cache-invalidation',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RoleCacheService, RoleCacheProcessor],
  exports: [RoleCacheService],
})
export class RoleCacheModule {}
