import * as path from 'path';

import { BaseModel } from '@core/database/models/base.model';

export class UserModel extends BaseModel {
  static tableName = 'users';

  id!: number;
  name!: string;
  email!: string;
  password!: string;

  static relationMappings = {
    tenants: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.join(__dirname, '../../tenants/models/tenant.model'),
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
      modelClass: path.join(__dirname, '../../roles/models/role.model'),
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
