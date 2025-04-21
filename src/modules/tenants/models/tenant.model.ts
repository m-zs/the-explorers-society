import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'objection';

import { UserModel } from '@modules/users/models/user.model';

export class TenantModel extends Model {
  static tableName = 'tenants';

  static jsonSchema = {
    type: 'object',
    required: ['name', 'domain'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      domain: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };

  @ApiProperty({
    description: 'The unique identifier of the tenant',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'The name of the tenant',
    example: 'Acme Corp',
  })
  name!: string;

  @ApiProperty({
    description: 'The domain of the tenant',
    example: 'acme.example.com',
  })
  domain!: string;

  @ApiProperty({
    description: 'The date when the tenant was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date when the tenant was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'The users associated with this tenant',
    type: () => [UserModel],
    required: false,
  })
  users?: UserModel[];

  static relationMappings = {
    users: {
      relation: Model.HasManyRelation,
      modelClass: UserModel,
      join: {
        from: 'tenants.id',
        to: 'users.tenantId',
      },
    },
  };
}
