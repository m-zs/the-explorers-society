import { Injectable } from '@nestjs/common';

import { RedisService } from '@core/redis/redis.service';

import { CachedRole, RoleCachePayload } from './role-cache.interface';

@Injectable()
export class RoleCacheService {
  private readonly PREFIX = 'role_cache';
  private readonly TTL = 3600;

  constructor(private readonly redisService: RedisService) {}

  async cacheUserRoles({
    userId,
    payload,
    tenantId,
  }: {
    userId: number;
    payload: RoleCachePayload;
    tenantId?: number;
  }): Promise<void> {
    const key = this.getKey(userId, tenantId);
    await this.redisService.set(
      key,
      JSON.stringify({
        ...payload,
        expiresAt: Date.now() + this.TTL * 1000,
      }),
      this.TTL,
    );
  }

  async getCachedRoles(
    userId: number,
    tenantId?: number,
  ): Promise<CachedRole | null> {
    const key = this.getKey(userId, tenantId);
    const data = await this.redisService.get(key);
    return data ? (JSON.parse(data) as CachedRole) : null;
  }

  async invalidateUserRoles(userId: number, tenantId?: number): Promise<void> {
    const key = this.getKey(userId, tenantId);
    await this.redisService.del(key);
  }

  private getKey(userId: number, tenantId?: number): string {
    return `${this.PREFIX}:${userId}:${tenantId ?? 'global'}`;
  }
}
