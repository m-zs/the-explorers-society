import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { AppRole } from '@modules/auth/enums/app-role.enum';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created',
    type: RoleModel,
  })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleModel> {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all roles',
    type: [RoleModel],
  })
  async findAll(): Promise<RoleModel[]> {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role found',
    type: RoleModel,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async findOne(@Param('id', ParseIntPipe) id: AppRole): Promise<RoleModel> {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated',
    type: RoleModel,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async update(
    @Param('id', ParseIntPipe) id: AppRole,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleModel> {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Role deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async remove(@Param('id', ParseIntPipe) id: AppRole): Promise<AppRole> {
    return await this.rolesService.remove(id);
  }

  @Get(':id/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get users with a specific role' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users with the role',
    type: RoleModel,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async getUsersWithRoleId(
    @Param('id', ParseIntPipe) id: AppRole,
  ): Promise<RoleModel> {
    return await this.rolesService.getUsersWithRoleId(id);
  }
}
