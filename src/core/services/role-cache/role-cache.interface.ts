import { AppRole } from '@modules/auth/enums/app-role.enum';

export type CachedRole = RoleCachePayload;

export type RoleCachePayload = {
  roles: AppRole[];
};
