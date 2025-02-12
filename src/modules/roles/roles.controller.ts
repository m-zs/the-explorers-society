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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

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
    return this.rolesService.create(createRoleDto);
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
    return this.rolesService.findAll();
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
  async findOne(@Param('id') id: number): Promise<RoleModel | undefined> {
    return this.rolesService.findOne(id);
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
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleModel | undefined> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Role deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async remove(@Param('id') id: number): Promise<number | undefined> {
    return this.rolesService.remove(id);
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
    @Param('id') id: number,
  ): Promise<RoleModel | undefined> {
    return this.rolesService.getUsersWithRoleId(id);
  }
}
