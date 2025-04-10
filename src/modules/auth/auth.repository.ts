import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { UserModel } from '@modules/users/models/user.model';

import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthRepository {
  constructor(@Inject('UserModel') private modelClass: ModelClass<UserModel>) {}

  async getUserByEmail(data: SignInDto): Promise<UserModel | undefined> {
    return this.modelClass.query().findOne({ email: data.email });
  }
}
