import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Try to get tenant ID from various sources
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId || isNaN(+tenantId)) {
      throw new BadRequestException('Tenant ID is required');
    }

    req['tenantId'] = +tenantId;
    next();
  }
}
