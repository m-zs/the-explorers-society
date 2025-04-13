import { BaseModel } from '@core/database/models/base.model';
import { UserModel } from '@modules/users/models/user.model';
export class TenantModel extends BaseModel {
  static tableName = 'tenants';

  id!: number;
  name!: string;
  domain!: string;

  static relationMappings = {
    users: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: UserModel,
      join: {
        from: 'tenants.id',
        through: {
          from: 'tenant_users.tenant_id',
          to: 'tenant_users.user_id',
        },
        to: 'users.id',
      },
    },
  };
}
