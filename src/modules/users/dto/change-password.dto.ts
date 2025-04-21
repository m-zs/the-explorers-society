import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class ChangePasswordDto extends PickType(CreateUserDto, ['password']) {
  @ApiProperty({
    description: 'New password',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
