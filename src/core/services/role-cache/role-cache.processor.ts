import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { RedisService } from '@core/redis/redis.service';

interface InvalidationJob {
  userId: number;
  tenantId?: number;
}

@Processor('role-cache-invalidation')
export class RoleCacheProcessor extends WorkerHost {
  private readonly logger = new Logger(RoleCacheProcessor.name);

  constructor(private readonly redisService: RedisService) {
    super();
  }

  async process(job: Job<InvalidationJob>): Promise<void> {
    const { userId, tenantId } = job.data;

    try {
      const key = this.getKey(userId, tenantId);
      await this.redisService.del(key);
      this.logger.debug(
        `Successfully invalidated cache for user ${userId}${
          tenantId ? ` in tenant ${tenantId}` : ''
        }`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Failed to invalidate cache for user ${userId}: ${error.message}`,
      );
      throw error; // Rethrowing to let BullMQ handle retries
    }
  }

  private getKey(userId: number, tenantId?: number): string {
    return `role_cache:${userId}:${tenantId ?? 'global'}`;
  }
}
