import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserModel> {
    return await this.userRepository.createUser(createUserDto);
  }

  async findAll(): Promise<UserModel[]> {
    return await this.userRepository.getAllUsers();
  }

  async findOne(id: number): Promise<UserModel | undefined> {
    return await this.userRepository.getUserById(id);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserModel | undefined> {
    return await this.userRepository.updateUser(id, updateUserDto);
  }

  async remove(id: number): Promise<number> {
    return await this.userRepository.removeUser(id);
  }

  async getUserWithTenants(id: number): Promise<UserModel | undefined> {
    return await this.userRepository.getUserWithTenants(id);
  }

  async getUserWithRoles(id: number): Promise<UserModel | undefined> {
    return await this.userRepository.getUserWithRoles(id);
  }

  async getUserWithTenantsAndRoles(id: number): Promise<UserModel | undefined> {
    return await this.userRepository.getUserWithTenantsAndRoles(id);
  }
}
