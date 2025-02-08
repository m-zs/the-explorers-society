import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantModel } from './tenant.model';

@Injectable()
export class TenantRepository {
  constructor(
    @Inject('TenantModel') private modelClass: ModelClass<TenantModel>,
  ) {}

  async createTenant(data: CreateTenantDto): Promise<TenantModel> {
    return this.modelClass.query().insertAndFetch(data);
  }

  async createTenants(data: CreateTenantDto[]): Promise<TenantModel[]> {
    return await this.modelClass.query().insert(data).returning('*');
  }

  async getAllTenants(): Promise<TenantModel[]> {
    return this.modelClass.query();
  }

  async getTenantById(id: number): Promise<TenantModel | undefined> {
    return this.modelClass.query().findById(id);
  }

  async updateTenant(
    id: number,
    data: UpdateTenantDto,
  ): Promise<TenantModel | undefined> {
    return this.modelClass.query().patchAndFetchById(id, data);
  }

  async removeTenant(id: number): Promise<number> {
    return this.modelClass.query().deleteById(id);
  }
}
