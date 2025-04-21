import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { AuthGuard } from '@modules/auth/guards/auth.guard';

import { CheckUserAccess } from './decorators/check-user-access.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserWithRolesDto } from './dto/user-with-roles.dto';
import { UserWithTenantsAndRolesDto } from './dto/user-with-tenants-and-roles.dto';
import { UserWithTenantsDto } from './dto/user-with-tenants.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    type: [UserResponseDto],
  })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the user.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async findOne(
    @CheckUserAccess('id') id: number,
  ): Promise<UserResponseDto | undefined> {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async update(
    @CheckUserAccess('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto | undefined> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully changed.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid current password.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async changePassword(
    @CheckUserAccess('id') id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponseDto | undefined> {
    return await this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    type: 'number',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async remove(@CheckUserAccess('id') id: number): Promise<number> {
    return await this.usersService.remove(id);
  }

  @Get(':id/tenants')
  @ApiOperation({ summary: 'Get a user with their tenants' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the user with their tenants.',
    type: UserWithTenantsDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async getUserWithTenants(
    @CheckUserAccess('id') id: number,
  ): Promise<UserWithTenantsDto | undefined> {
    return await this.usersService.getUserWithTenants(id);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get a user with their roles' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the user with their roles.',
    type: UserWithRolesDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async getUserWithRoles(
    @CheckUserAccess('id') id: number,
  ): Promise<UserWithRolesDto | undefined> {
    return await this.usersService.getUserWithRoles(id);
  }

  @Get(':id/tenants-and-roles')
  @ApiOperation({ summary: 'Get a user with their tenants and roles' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the user with their tenants and roles.',
    type: UserWithTenantsAndRolesDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard([AppRole.ADMIN, AppRole.SUPPORT, AppRole.USER]))
  async getUserWithTenantsAndRoles(
    @CheckUserAccess('id') id: number,
  ): Promise<UserWithTenantsAndRolesDto | undefined> {
    return await this.usersService.getUserWithTenantsAndRoles(id);
  }
}
