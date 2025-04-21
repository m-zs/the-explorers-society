import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RequestWithUser } from '@modules/auth/interfaces/request-with-user.interface';

export const CheckUserAccess = createParamDecorator(
  (paramName: string, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    const user = request.user;
    const paramId = +request.params?.[paramName];

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    if (
      user.roles?.includes(AppRole.ADMIN) ||
      user.roles?.includes(AppRole.SUPPORT)
    ) {
      return paramId;
    }

    if (+user.sub !== paramId) {
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );
    }

    return paramId;
  },
);
