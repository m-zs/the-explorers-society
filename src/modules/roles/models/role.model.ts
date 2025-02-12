import { ApiProperty } from '@nestjs/swagger';

import { BaseModel } from '@core/database/models/base.model';
import { UserModel } from '@modules/users/models/user.model';
import { RoleType } from '@modules/users/role.enum';

export class RoleModel extends BaseModel {
  static tableName = 'roles';

  @ApiProperty({ description: 'Unique identifier for the role', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Name of the role', example: 'Admin' })
  name!: string;

  @ApiProperty({
    description: 'Type of role',
    example: 'Tenant',
  })
  type!: RoleType;

  static relationMappings = {
    users: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: UserModel,
      join: {
        from: 'roles.id',
        through: {
          from: 'tenant_roles.role_id',
          to: 'tenant_roles.user_id',
        },
        to: 'users.id',
      },
    },
  };
}
