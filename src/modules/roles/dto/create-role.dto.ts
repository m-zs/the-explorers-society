import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { RoleType } from '@modules/users/role.enum';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of role',
    example: RoleType.GLOBAL,
    enum: RoleType,
  })
  @IsEnum(RoleType)
  @IsNotEmpty()
  type: RoleType;
}
