import { AppRole } from '../enums/app-role.enum';
import { TenantRole } from '../enums/tenant-role.enum';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  tenantId: string;
  roles?: AppRole[];
  tenantRoles?: TenantRole[];
}
