import { Injectable } from '@nestjs/common';

import { PasswordService } from '@core/services/password/password.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<UserModel, 'password'>> {
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    const userWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
    };
    const user = await this.userRepository.createUser(userWithHashedPassword);

    return user;
  }

  async findAll(): Promise<Omit<UserModel, 'password'>[]> {
    return await this.userRepository.getAllUsers();
  }

  async findOne(id: number): Promise<Omit<UserModel, 'password'> | undefined> {
    return await this.userRepository.getUserById(id);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    let password = updateUserDto.password;
    if (password) {
      password = await this.passwordService.hashPassword(password);
    }

    const user = await this.userRepository.updateUser(id, {
      ...updateUserDto,
      password,
    });
    if (!user) return undefined;

    return user;
  }

  async remove(id: number): Promise<number> {
    return await this.userRepository.removeUser(id);
  }

  async getUserWithTenants(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return await this.userRepository.getUserWithTenants(id);
  }

  async getUserWithRoles(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return await this.userRepository.getUserWithRoles(id);
  }

  async getUserWithTenantsAndRoles(
    id: number,
  ): Promise<Omit<UserModel, 'password'> | undefined> {
    return await this.userRepository.getUserWithTenantsAndRoles(id);
  }
}
