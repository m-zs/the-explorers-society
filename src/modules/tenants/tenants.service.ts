import { Injectable } from '@nestjs/common';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantModel } from './tenant.model';
import { TenantRepository } from './tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantModel> {
    return this.tenantRepository.createTenant(createTenantDto);
  }

  async findAll(): Promise<TenantModel[]> {
    return this.tenantRepository.getAllTenants();
  }

  async findOne(id: number): Promise<TenantModel | undefined> {
    return this.tenantRepository.getTenantById(id);
  }

  async update(
    id: number,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantModel | undefined> {
    return this.tenantRepository.updateTenant(id, updateTenantDto);
  }

  async remove(id: number): Promise<number> {
    return this.tenantRepository.removeTenant(id);
  }
}
