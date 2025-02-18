import { Injectable } from '@nestjs/common';

import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async signIn(_signInDto: SignInDto) {
    return 'This action adds a new auth';
  }
}
