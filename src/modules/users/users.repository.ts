import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';

@Injectable()
export class UserRepository {
  constructor(@Inject('UserModel') private modelClass: ModelClass<UserModel>) {}

  async createUser(data: CreateUserDto): Promise<UserModel> {
    return this.modelClass.query().insertAndFetch(data);
  }

  async createUsers(data: CreateUserDto[]): Promise<UserModel[]> {
    return this.modelClass.query().insert(data).returning('*');
  }

  async getAllUsers(): Promise<UserModel[]> {
    return this.modelClass.query();
  }

  async getUserById(id: number): Promise<UserModel | undefined> {
    return this.modelClass.query().findById(id);
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
  ): Promise<UserModel | undefined> {
    return this.modelClass.query().patchAndFetchById(id, data);
  }

  async removeUser(id: number): Promise<number> {
    return this.modelClass.query().deleteById(id);
  }

  async getUserWithTenants(id: number): Promise<UserModel | undefined> {
    return this.modelClass.query().findById(id).withGraphFetched('tenants');
  }

  async getUserWithRoles(id: number): Promise<UserModel | undefined> {
    return this.modelClass.query().findById(id).withGraphFetched('roles');
  }

  async getUserWithTenantsAndRoles(id: number): Promise<UserModel | undefined> {
    return this.modelClass
      .query()
      .findById(id)
      .withGraphFetched('[tenants, roles]');
  }
}
