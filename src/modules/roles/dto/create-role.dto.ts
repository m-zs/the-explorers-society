import { ApiProperty } from '@nestjs/swagger';

import { RoleType } from '@modules/users/role.enum';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    description: 'Type of role',
    example: RoleType.GLOBAL,
  })
  type: RoleType;
}
