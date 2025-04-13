import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Put,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserWithoutPassword,
  UserWithTenants,
  UserWithRoles,
  UserWithTenantsAndRoles,
} from './types/user.types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserWithoutPassword> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<UserWithoutPassword[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<UserWithoutPassword | undefined> {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword | undefined> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<number> {
    return await this.usersService.remove(id);
  }

  @Get(':id/tenants')
  async getUserWithTenants(
    @Param('id') id: number,
  ): Promise<UserWithTenants | undefined> {
    return await this.usersService.getUserWithTenants(id);
  }

  @Get(':id/roles')
  async getUserWithRoles(
    @Param('id') id: number,
  ): Promise<UserWithRoles | undefined> {
    return await this.usersService.getUserWithRoles(id);
  }

  @Get(':id/tenants-and-roles')
  async getUserWithTenantsAndRoles(
    @Param('id') id: number,
  ): Promise<UserWithTenantsAndRoles | undefined> {
    return await this.usersService.getUserWithTenantsAndRoles(id);
  }
}
