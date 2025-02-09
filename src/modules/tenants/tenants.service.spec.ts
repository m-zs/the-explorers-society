import { faker } from '@faker-js/faker'; // Import faker
import { Test, TestingModule } from '@nestjs/testing';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantModel } from './tenant.model';
import { TenantRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

const mockTenantsService = {
  createTenant: jest.fn(),
  getAllTenants: jest.fn(),
  getTenantById: jest.fn(),
  updateTenant: jest.fn(),
  removeTenant: jest.fn(),
};

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: jest.Mocked<TenantRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: TenantRepository, useValue: mockTenantsService },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get<jest.Mocked<TenantRepository>>(TenantRepository);
  });

  describe('create', () => {
    it('should successfully create a tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: faker.company.name(),
        domain: faker.internet.domainName(),
      };

      const mockTenant: TenantModel = new TenantModel();
      mockTenant.id = faker.number.int();
      mockTenant.name = createTenantDto.name;
      mockTenant.domain = createTenantDto.domain;

      repository.createTenant.mockResolvedValue(mockTenant);

      const result = await service.create(createTenantDto);
      expect(result).toEqual(mockTenant);
      expect(repository.createTenant).toHaveBeenCalledWith(createTenantDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const mockTenants: TenantModel[] = [new TenantModel(), new TenantModel()];

      repository.getAllTenants.mockResolvedValue(mockTenants);

      const result = await service.findAll();
      expect(result).toEqual(mockTenants);
      expect(repository.getAllTenants).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single tenant', async () => {
      const mockTenant: TenantModel = new TenantModel();
      mockTenant.id = faker.number.int();
      mockTenant.name = faker.company.name();
      mockTenant.domain = faker.internet.domainName();

      const id = mockTenant.id;
      repository.getTenantById.mockResolvedValue(mockTenant);

      const result = await service.findOne(id);
      expect(result).toEqual(mockTenant);
      expect(repository.getTenantById).toHaveBeenCalledWith(id);
    });

    it('should return undefined if tenant not found', async () => {
      const id = faker.number.int();
      repository.getTenantById.mockResolvedValue(undefined);

      const result = await service.findOne(id);
      expect(result).toBeUndefined();
      expect(repository.getTenantById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should successfully update a tenant', async () => {
      const id = faker.number.int();
      const updateTenantDto: UpdateTenantDto = {
        name: faker.company.name(),
        domain: faker.internet.domainName(),
      };

      const updatedTenant: TenantModel = new TenantModel();
      updatedTenant.id = id;
      updatedTenant.name = updateTenantDto.name!;
      updatedTenant.domain = updateTenantDto.domain!;

      repository.updateTenant.mockResolvedValue(updatedTenant);

      const result = await service.update(id, updateTenantDto);
      expect(result).toEqual(updatedTenant);
      expect(repository.updateTenant).toHaveBeenCalledWith(id, updateTenantDto);
    });

    it('should return undefined if tenant to update is not found', async () => {
      const id = faker.number.int();
      const updateTenantDto: UpdateTenantDto = {
        name: faker.company.name(),
        domain: faker.internet.domainName(),
      };

      repository.updateTenant.mockResolvedValue(undefined);

      const result = await service.update(id, updateTenantDto);
      expect(result).toBeUndefined();
      expect(repository.updateTenant).toHaveBeenCalledWith(id, updateTenantDto);
    });
  });

  describe('remove', () => {
    it('should successfully remove a tenant', async () => {
      const id = faker.number.int();

      repository.removeTenant.mockResolvedValue(id);

      const result = await service.remove(id);
      expect(result).toBe(id);
      expect(repository.removeTenant).toHaveBeenCalledWith(id);
    });

    it('should return 0 if tenant removal fails', async () => {
      const id = faker.number.int();

      repository.removeTenant.mockResolvedValue(0);

      const result = await service.remove(id);
      expect(result).toBe(0);
      expect(repository.removeTenant).toHaveBeenCalledWith(id);
    });
  });
});
