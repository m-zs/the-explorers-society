import { Request } from 'express';

import { AuthUser } from './auth-user.interface';

export type RequestWithUser = Request & AuthUser;
