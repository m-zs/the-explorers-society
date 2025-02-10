import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';

@Injectable()
export class UserRepository {
  constructor(@Inject('UserModel') private modelClass: ModelClass<UserModel>) {}

  async createUser(data: CreateUserDto): Promise<Omit<UserModel, 'password'>> {
    return this.modelClass
      .query()
      .insertAndFetch(data)
      .select('id', 'name', 'email');
  }

  async createUsers(
    data: CreateUserDto[],
  ): Promise<Omit<UserModel, 'password'>[]> {
    return this.modelClass.query().insert(data).select('id', 'name', 'email');
  }

  async getAllUsers(): Promise<Omit<UserModel, 'password'>[]> {
    return this.modelClass.query().select('id', 'name', 'email');
  }

  async getUserById(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return this.modelClass.query().findById(id).select('id', 'name', 'email');
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return this.modelClass
      .query()
      .patchAndFetchById(id, data)
      .select('id', 'name', 'email');
  }

  async removeUser(id: number): Promise<number> {
    return this.modelClass.query().deleteById(id);
  }

  async getUserWithTenants(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('tenants');
  }

  async getUserWithRoles(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('roles');
  }

  async getUserWithTenantsAndRoles(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return this.modelClass
      .query()
      .findById(id)
      .select('id', 'name', 'email')
      .withGraphFetched('[tenants, roles]');
  }
}
