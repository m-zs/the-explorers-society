import { PickType } from '@nestjs/mapped-types';

import { UserModel } from '../models/user.model';

export class UserWithPasswordDto extends PickType(UserModel, ['password']) {}
