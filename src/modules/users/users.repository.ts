import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import {
  UserWithoutPassword,
  UserWithRoles,
  UserWithTenants,
  UserWithTenantsAndRoles,
} from './types/user.types';

@Injectable()
export class UserRepository {
  constructor(@Inject('UserModel') private modelClass: ModelClass<UserModel>) {}

  async createUser(data: CreateUserDto): Promise<UserWithoutPassword> {
    return this.modelClass
      .query()
      .insertAndFetch(data)
      .select('id', 'name', 'email');
  }

  async createUsers(data: CreateUserDto[]): Promise<UserWithoutPassword[]> {
    return this.modelClass
      .query()
      .insert(data)
      .returning(['id', 'name', 'email']);
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return this.modelClass.query().select('id', 'name', 'email');
  }

  async getUserById(id: number): Promise<UserWithoutPassword | undefined> {
    return this.modelClass.query().findById(id).select('id', 'name', 'email');
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
  ): Promise<UserWithoutPassword | undefined> {
    return this.modelClass
      .query()
      .patchAndFetchById(id, data)
      .select('id', 'name', 'email');
  }

  async removeUser(id: number): Promise<number> {
    return this.modelClass.query().deleteById(id);
  }

  async getUserWithTenants(id: number): Promise<UserWithTenants | undefined> {
    const user = await this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('tenants');
    return user as UserWithTenants | undefined;
  }

  async getUserWithRoles(id: number): Promise<UserWithRoles | undefined> {
    const user = await this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('roles');
    return user as UserWithRoles | undefined;
  }

  async getUserWithTenantsAndRoles(
    id: number,
  ): Promise<UserWithTenantsAndRoles | undefined> {
    const user = await this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('[tenants, roles]')
      .modifyGraph('roles', (builder) => {
        builder.select('roles.*', 'tenant_roles.tenant_id');
      });
    return user as UserWithTenantsAndRoles | undefined;
  }

  async getUserByEmail(email: string): Promise<UserModel | undefined> {
    return this.modelClass.query().findOne({ email });
  }
}
