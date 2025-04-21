import { PickType } from '@nestjs/swagger';

import { UserModel } from '../models/user.model';

export class UserWithRolesDto extends PickType(UserModel, [
  'id',
  'email',
  'name',
  'roles',
]) {}
