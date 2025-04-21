import * as path from 'path';

import { ApiProperty } from '@nestjs/swagger';

import { BaseModel } from '@core/database/models/base.model';
import { RoleModel } from '@modules/roles/models/role.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';

export class UserModel extends BaseModel {
  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      id: { type: 'integer' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      tenant_id: { type: ['integer', 'null'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };

  static get indexes() {
    return [
      {
        columns: ['email'],
        unique: true,
      },
      {
        columns: ['tenant_id'],
      },
    ];
  }

  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email!: string;

  password!: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'The ID of the tenant this user belongs to',
    example: 1,
    required: false,
  })
  tenant_id?: number | null;

  @ApiProperty({
    description: 'The associated tenant',
    type: () => TenantModel,
    required: false,
  })
  tenant?: TenantModel | null;

  @ApiProperty({
    description: 'The associated roles',
    type: () => [RoleModel],
    required: false,
  })
  roles?: RoleModel[] | null;

  static relationMappings = {
    tenant: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: path.join(__dirname, '../../tenants/models/tenant.model'),
      join: {
        from: 'users.tenant_id',
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
