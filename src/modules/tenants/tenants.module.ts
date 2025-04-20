import { Module } from '@nestjs/common';

import { TenantsController } from './tenants.controller';
import { TenantRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantRepository, TenantsService],
  exports: [TenantsService, TenantRepository],
})
export class TenantsModule {}
