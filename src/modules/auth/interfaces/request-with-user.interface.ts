import { Request } from 'express';

import { AppRole } from '../enums/app-role.enum';
import { TenantRole } from '../enums/tenant-role.enum';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    tenantId: string;
    tenantRoles: TenantRole[];
    roles: AppRole[];
  };
}
