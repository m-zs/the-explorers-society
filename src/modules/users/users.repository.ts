import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserWithPasswordDto } from './dto/user-with-password.dto';
import { UserWithRolesDto } from './dto/user-with-roles.dto';
import { UserWithTenantsAndRolesDto } from './dto/user-with-tenants-and-roles.dto';
import { UserWithTenantsDto } from './dto/user-with-tenants.dto';
import { UserModel } from './models/user.model';

@Injectable()
export class UserRepository {
  constructor(@Inject('UserModel') private modelClass: ModelClass<UserModel>) {}

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    return this.modelClass
      .query()
      .insertAndFetch(data)
      .select('id', 'name', 'email');
  }

  async createUsers(data: CreateUserDto[]): Promise<UserResponseDto[]> {
    return this.modelClass
      .query()
      .insert(data)
      .returning(['id', 'name', 'email']);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.modelClass.query().select('id', 'name', 'email');
  }

  async getUserById(id: number): Promise<UserResponseDto | undefined> {
    return this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email', 'tenantId');
  }

  async getUserByIdWithPassword(
    id: number,
  ): Promise<UserWithPasswordDto | undefined> {
    return this.modelClass.query().findById(id).select('id', 'password');
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
  ): Promise<UserResponseDto | undefined> {
    return this.modelClass
      .query()
      .patchAndFetchById(id, data)
      .select('id', 'name', 'email');
  }

  async updateUserPassword(
    id: number,
    password: string,
  ): Promise<UserResponseDto | undefined> {
    return this.modelClass
      .query()
      .patchAndFetchById(id, { password })
      .select('id', 'name', 'email');
  }

  async removeUser(id: number): Promise<number> {
    return this.modelClass.query().deleteById(id);
  }

  async getUserWithTenants(
    id: number,
  ): Promise<UserWithTenantsDto | undefined> {
    const user = await this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('tenant');
    return user as UserWithTenantsDto | undefined;
  }

  async getUserWithRoles(id: number): Promise<UserWithRolesDto | undefined> {
    const user = await this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('roles');
    return user as UserWithRolesDto | undefined;
  }

  async getUserWithTenantsAndRoles(
    id: number,
  ): Promise<UserWithTenantsAndRolesDto | undefined> {
    const user = await this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('[tenant, roles]')
      .modifyGraph('roles', (builder) => {
        builder.select('roles.*', 'tenant_roles.tenant_id');
      });
    return user as UserWithTenantsAndRolesDto | undefined;
  }

  async getUserByEmail(email: string): Promise<UserModel | undefined> {
    return this.modelClass.query().findOne({ email });
  }

  async findByTenantId(tenantId: number): Promise<UserResponseDto[]> {
    return this.modelClass
      .query()
      .where('tenantId', tenantId)
      .withGraphFetched('tenant');
  }
}
