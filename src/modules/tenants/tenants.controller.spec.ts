import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantModel } from './tenant.model';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

const generateMockTenant = (id?: number): TenantModel => {
  const tenant = new TenantModel();
  tenant.id = id || faker.number.int({ min: 1, max: 1000 });
  tenant.name = faker.company.name();
  tenant.domain = faker.internet.domainName();
  return tenant;
};

describe('TenantsController', () => {
  let tenantsController: TenantsController;
  let tenantsService: TenantsService;

  const mockTenant = generateMockTenant();
  const mockTenants = Array.from({ length: 5 }, generateMockTenant);

  const mockTenantsService = {
    create: jest.fn().mockResolvedValue(mockTenant),
    findAll: jest.fn().mockResolvedValue(mockTenants),
    findOne: jest.fn().mockResolvedValue(mockTenant),
    update: jest.fn().mockResolvedValue(mockTenant),
    remove: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [{ provide: TenantsService, useValue: mockTenantsService }],
    }).compile();

    tenantsController = module.get<TenantsController>(TenantsController);
    tenantsService = module.get<TenantsService>(TenantsService);
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: faker.company.name(),
        domain: faker.internet.domainName(),
      };
      const result = await tenantsController.create(createTenantDto);

      expect(result).toEqual(mockTenant);
      expect(tenantsService.create).toHaveBeenCalledWith(createTenantDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const result = await tenantsController.findAll();
      expect(result).toEqual(mockTenants);
      expect(tenantsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single tenant', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });
      const mockedTenant = generateMockTenant(id);

      jest.spyOn(tenantsService, 'findOne').mockResolvedValueOnce(mockedTenant);

      const result = await tenantsController.findOne(id);
      expect(result).toEqual(mockedTenant);
      expect(tenantsService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: faker.company.name(),
        domain: faker.internet.domainName(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });
      const expectedResult = generateMockTenant(id);

      jest
        .spyOn(tenantsService, 'update')
        .mockResolvedValueOnce(expectedResult);

      const result = await tenantsController.update(id, updateTenantDto);
      expect(result).toEqual(expectedResult);
      expect(tenantsService.update).toHaveBeenCalledWith(id, updateTenantDto);
    });
  });

  describe('remove', () => {
    it('should remove a tenant', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(tenantsService, 'remove').mockResolvedValueOnce(id);

      const result = await tenantsController.remove(id);
      expect(result).toBe(id);
      expect(tenantsService.remove).toHaveBeenCalledWith(id);
    });
  });
});
