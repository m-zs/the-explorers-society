import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthUser } from '../interfaces/auth-user.interface';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const AuthUserPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return { user: request.user, tenantId: request.tenantId };
  },
);
