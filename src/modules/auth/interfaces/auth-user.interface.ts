import { AppRole } from '../enums/app-role.enum';

export type AuthUser = {
  user: {
    sub: string;
    email: string;
    tenantRoles?: AppRole[];
    roles?: AppRole[];
  };
  tenantId: number;
};
