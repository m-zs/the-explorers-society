import { BaseModel } from '@core/database/models/base.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';

import { RoleModel } from './role.model';

export class UserModel extends BaseModel {
  static tableName = 'users';

  id!: number;
  name!: string;
  email!: string;
  password!: string;

  static relationMappings = {
    tenants: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: TenantModel,
      join: {
        from: 'users.id',
        through: {
          from: 'tenant_users.user_id',
          to: 'tenant_users.tenant_id',
        },
        to: 'tenants.id',
      },
    },
    roles: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: RoleModel,
      join: {
        from: 'users.id',
        through: {
          from: 'tenant_roles.user_id',
          to: 'tenant_roles.role_id',
        },
        to: 'roles.id',
      },
    },
  };
}
