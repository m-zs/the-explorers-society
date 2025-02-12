import { Injectable } from '@nestjs/common';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';
import { RoleRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleModel> {
    return this.roleRepository.createRole(createRoleDto);
  }

  async createMultipleRoles(
    createRolesDto: CreateRoleDto[],
  ): Promise<RoleModel[]> {
    return this.roleRepository.createRoles(createRolesDto);
  }

  async findAll(): Promise<RoleModel[]> {
    return this.roleRepository.getAllRoles();
  }

  async findOne(id: number): Promise<RoleModel | undefined> {
    return this.roleRepository.getRoleById(id);
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleModel | undefined> {
    return this.roleRepository.updateRole(id, updateRoleDto);
  }

  async remove(id: number): Promise<number> {
    return this.roleRepository.removeRole(id);
  }

  async getUsersWithRoleId(id: number): Promise<RoleModel | undefined> {
    return this.roleRepository.getUsersWithRoleId(id);
  }
}
