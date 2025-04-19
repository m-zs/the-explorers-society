import { Request } from 'express';

import { AppRole } from '../enums/app-role.enum';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    tenantRoles?: AppRole[];
    roles?: AppRole[];
  };
  tenantId: number;
}
