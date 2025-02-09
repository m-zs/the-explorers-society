import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantModel } from './tenant.model';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantModel> {
    return await this.tenantsService.create(createTenantDto);
  }

  @Get()
  async findAll(): Promise<TenantModel[]> {
    return await this.tenantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<TenantModel | undefined> {
    return await this.tenantsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantModel | undefined> {
    return await this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<number> {
    return await this.tenantsService.remove(id);
  }
}
