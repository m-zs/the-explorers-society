import { Tokens } from './tokens.interface';

export interface InternalTokens extends Tokens {
  refreshToken: string;
}
