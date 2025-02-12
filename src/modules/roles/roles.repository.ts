import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';

@Injectable()
export class RoleRepository {
  constructor(@Inject('RoleModel') private modelClass: ModelClass<RoleModel>) {}

  async createRole(data: CreateRoleDto): Promise<RoleModel> {
    return this.modelClass.query().insertAndFetch(data);
  }

  async createRoles(data: CreateRoleDto[]): Promise<RoleModel[]> {
    return this.modelClass.query().insert(data);
  }

  async getAllRoles(): Promise<RoleModel[]> {
    return this.modelClass.query();
  }

  async getRoleById(id: number): Promise<RoleModel | undefined> {
    return this.modelClass.query().findById(id);
  }

  async updateRole(
    id: number,
    data: UpdateRoleDto,
  ): Promise<RoleModel | undefined> {
    return this.modelClass.query().patchAndFetchById(id, data);
  }

  async removeRole(id: number): Promise<number> {
    return this.modelClass.query().deleteById(id);
  }

  async getUsersWithRoleId(id: number): Promise<RoleModel | undefined> {
    return this.modelClass.query().findById(id).withGraphFetched('users');
  }
}
