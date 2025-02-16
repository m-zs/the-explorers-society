import { Injectable, NotFoundException } from '@nestjs/common';

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

  async findOne(id: number): Promise<RoleModel> {
    const role = await this.roleRepository.getRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleModel> {
    const role = await this.roleRepository.updateRole(id, updateRoleDto);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async remove(id: number): Promise<number> {
    const deleted = await this.roleRepository.removeRole(id);
    if (!deleted) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return deleted;
  }

  async getUsersWithRoleId(id: number): Promise<RoleModel> {
    const role = await this.roleRepository.getUsersWithRoleId(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }
}
