import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { RedisService } from '@core/redis/redis.service';
import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleModel } from '@modules/roles/models/role.model';
import { RoleType } from '@modules/users/role.enum';

import { CachedRole, RoleCachePayload } from './role-cache.interface';

@Injectable()
export class RoleCacheService {
  private readonly logger = new Logger(RoleCacheService.name);
  private readonly TTL = 3600;
  private readonly USER_ROLES_PREFIX = 'user_roles';
  private readonly ROLE_USERS_PREFIX = 'role_users';

  constructor(
    private readonly redisService: RedisService,
    @InjectQueue('role-cache-invalidation')
    private readonly invalidationQueue: Queue,
  ) {}

  private mapUserRoles(roles: (RoleModel & { tenantId?: number })[]): {
    globalRoles: string[];
    tenantRoles: Record<number, string[]>;
  } {
    const userRoles = roles || [];

    // Map global roles
    const globalRoles = userRoles
      .filter((role) => role.type === RoleType.GLOBAL)
      .map((role) => role.name as AppRole);

    // Map tenant-specific roles
    const tenantRoles = userRoles.reduce(
      (acc, role) => {
        if (role.type === RoleType.TENANT && role.tenantId) {
          if (!acc[role.tenantId]) {
            acc[role.tenantId] = [];
          }
          acc[role.tenantId].push(role.name);
        }
        return acc;
      },
      {} as Record<number, string[]>,
    );

    return {
      globalRoles,
      tenantRoles,
    };
  }

  async cacheUserRoles({
    userId,
    payload,
    tenantId,
  }: {
    userId: number;
    payload: RoleCachePayload;
    tenantId?: number;
  }): Promise<void> {
    const userRolesMappingKey = this.getUserRolesMappingKey(userId, tenantId);

    // Only update if we have roles to add
    if (payload.roles.length > 0) {
      // Update user -> roles mapping
      await this.redisService.sadd(userRolesMappingKey, ...payload.roles);
      await this.redisService.expire(userRolesMappingKey, this.TTL);

      // Update role -> users mapping
      await Promise.all(
        payload.roles.map((role) =>
          this.redisService.sadd(
            this.getRoleUsersMappingKey(role, tenantId),
            String(userId),
          ),
        ),
      );
    }
  }

  async cacheUserRolesForAuthentication(
    userId: number,
    roles: (RoleModel & { tenantId?: number })[],
  ): Promise<void> {
    const { globalRoles, tenantRoles } = this.mapUserRoles(roles);

    // Cache global roles if any exist
    if (globalRoles.length > 0) {
      await this.cacheUserRoles({
        userId,
        payload: { roles: globalRoles },
      });
    }

    // Cache tenant-specific roles if any exist
    await Promise.all(
      Object.entries(tenantRoles).map(([tenantId, roles]) => {
        if (roles.length > 0) {
          return this.cacheUserRoles({
            userId,
            payload: { roles },
            tenantId: +tenantId,
          });
        }
        return Promise.resolve();
      }),
    );
  }

  async getUserCachedRoles(
    userId: number,
    tenantId?: number,
  ): Promise<CachedRole | null> {
    const userRolesMappingKey = this.getUserRolesMappingKey(userId, tenantId);
    const roles = await this.redisService.smembers(userRolesMappingKey);

    if (!roles.length) {
      return null;
    }

    return {
      roles,
    };
  }

  async getUsersByRole(role: string, tenantId?: number): Promise<number[]> {
    const roleUsersMappingKey = this.getRoleUsersMappingKey(role, tenantId);
    const userIds = await this.redisService.smembers(roleUsersMappingKey);
    return userIds.map(Number);
  }

  async getRolesByUser(userId: number, tenantId?: number): Promise<string[]> {
    const userRolesMappingKey = this.getUserRolesMappingKey(userId, tenantId);
    return this.redisService.smembers(userRolesMappingKey);
  }

  async invalidateUserRoles(userId: number, tenantId?: number): Promise<void> {
    const userRolesMappingKey = this.getUserRolesMappingKey(userId, tenantId);

    try {
      // Get all roles for this user
      const roles = await this.getRolesByUser(userId, tenantId);

      // Remove user from role -> users mappings
      await Promise.all(
        roles.map((role) =>
          this.redisService.srem(
            this.getRoleUsersMappingKey(role, tenantId),
            String(userId),
          ),
        ),
      );

      // Remove user's role mapping
      await this.redisService.del(userRolesMappingKey);

      this.logger.debug(
        `Successfully invalidated cache for user ${userId}${
          tenantId ? ` in tenant ${tenantId}` : ''
        }`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to invalidate cache for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async invalidateRole(role: string, tenantId?: number): Promise<void> {
    const roleUsersMappingKey = this.getRoleUsersMappingKey(role, tenantId);

    try {
      // Get all users with this role
      const userIds = await this.getUsersByRole(role, tenantId);

      // Queue invalidation jobs for all affected users
      await Promise.all(
        userIds.map((userId) =>
          this.invalidationQueue.add('invalidate', {
            userId,
            tenantId,
          }),
        ),
      );

      // Remove role -> users mapping
      await this.redisService.del(roleUsersMappingKey);

      this.logger.debug(
        `Successfully queued invalidation for role ${role}${
          tenantId ? ` in tenant ${tenantId}` : ''
        }`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to queue invalidation for role ${role}: ${error.message}`,
      );
      throw error;
    }
  }

  private getUserRolesMappingKey(userId: number, tenantId?: number): string {
    return `${this.USER_ROLES_PREFIX}:${userId}:${tenantId ?? 'global'}`;
  }

  private getRoleUsersMappingKey(role: string, tenantId?: number): string {
    return `${this.ROLE_USERS_PREFIX}:${role}:${tenantId ?? 'global'}`;
  }
}
