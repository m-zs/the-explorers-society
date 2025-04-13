import { RoleModel } from '@modules/roles/models/role.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';

import { UserModel } from '../models/user.model';

export type UserWithoutPassword = Omit<UserModel, 'password'>;
export type UserWithTenants = UserWithoutPassword & { tenants: TenantModel[] };
export type UserWithRoles = UserWithoutPassword & { roles: RoleModel[] };
export type UserWithTenantsAndRoles = UserWithoutPassword & {
  tenants: TenantModel[];
  roles: RoleModel[];
};
