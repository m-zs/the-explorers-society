import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PasswordService } from '@core/services/password/password.service';
import { TenantsService } from '@modules/tenants/tenants.service';

import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserWithRolesDto } from './dto/user-with-roles.dto';
import { UserWithTenantsAndRolesDto } from './dto/user-with-tenants-and-roles.dto';
import { UserWithTenantsDto } from './dto/user-with-tenants.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.tenantId) {
      try {
        await this.tenantsService.findOne(createUserDto.tenantId);
      } catch {
        throw new BadRequestException('Tenant does not exist');
      }
    }

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

  async findAll(): Promise<UserResponseDto[]> {
    return await this.userRepository.getAllUsers();
  }

  async findOne(id: number): Promise<UserResponseDto | undefined> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto | undefined> {
    const user = await this.userRepository.updateUser(id, updateUserDto);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponseDto | undefined> {
    const user = await this.userRepository.getUserByIdWithPassword(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isValidPassword = await this.passwordService.comparePassword(
      changePasswordDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Invalid current password');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePasswordDto.newPassword,
    );

    return await this.userRepository.updateUserPassword(id, hashedPassword);
  }

  async remove(id: number): Promise<number> {
    const result = await this.userRepository.removeUser(id);
    if (result === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }

  async getUserWithTenants(
    id: number,
  ): Promise<UserWithTenantsDto | undefined> {
    return await this.userRepository.getUserWithTenants(id);
  }

  async getUserWithRoles(id: number): Promise<UserWithRolesDto | undefined> {
    return await this.userRepository.getUserWithRoles(id);
  }

  async getUserWithTenantsAndRoles(
    id: number,
  ): Promise<UserWithTenantsAndRolesDto | undefined> {
    return await this.userRepository.getUserWithTenantsAndRoles(id);
  }

  async findByTenantId(tenantId: number): Promise<UserResponseDto[]> {
    return this.userRepository.findByTenantId(tenantId);
  }
}
