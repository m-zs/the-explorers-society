import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { RoleType } from '@modules/users/role.enum';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

const generateMockRole = (id?: number): RoleModel => {
  const role = new RoleModel();

  role.id = id || faker.number.int({ min: 1, max: 1000 });
  role.name = faker.word.noun();
  role.type = faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]);

  return role;
};

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: RolesService;

  const mockRole = generateMockRole();
  const mockRoles = Array.from({ length: 5 }, () => generateMockRole());

  const mockRolesService = {
    create: jest.fn().mockResolvedValue(mockRole),
    findAll: jest.fn().mockResolvedValue(mockRoles),
    findOne: jest.fn().mockResolvedValue(mockRole),
    update: jest.fn().mockResolvedValue(mockRole),
    remove: jest.fn().mockResolvedValue(1),
    getUsersWithRoleId: jest.fn().mockResolvedValue(mockRole),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockRolesService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
      };

      const result = await controller.create(createRoleDto);

      expect(result).toEqual(mockRole);
      expect(rolesService.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const result = await controller.findAll();

      expect(result).toEqual(mockRoles);
      expect(rolesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by ID', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });
      const mockedRole = generateMockRole(id);

      jest.spyOn(rolesService, 'findOne').mockResolvedValueOnce(mockedRole);

      const result = await controller.findOne(id);
      expect(result).toEqual(mockedRole);
      expect(rolesService.findOne).toHaveBeenCalledWith(id);
    });

    it('should return undefined if role is not found', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(rolesService, 'findOne').mockResolvedValueOnce(undefined);

      const result = await controller.findOne(id);
      expect(result).toBeUndefined();
      expect(rolesService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a role and return the updated role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });
      const expectedResult = generateMockRole(id);

      jest.spyOn(rolesService, 'update').mockResolvedValueOnce(expectedResult);

      const result = await controller.update(id, updateRoleDto);
      expect(result).toEqual(expectedResult);
      expect(rolesService.update).toHaveBeenCalledWith(id, updateRoleDto);
    });

    it('should return undefined if role is not found', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(rolesService, 'update').mockResolvedValueOnce(undefined);

      const result = await controller.update(id, updateRoleDto);
      expect(result).toBeUndefined();
      expect(rolesService.update).toHaveBeenCalledWith(id, updateRoleDto);
    });
  });

  describe('remove', () => {
    it('should remove a role and return the removed role ID', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(rolesService, 'remove').mockResolvedValueOnce(id);

      const result = await controller.remove(id);
      expect(result).toBe(id);
      expect(rolesService.remove).toHaveBeenCalledWith(id);
    });

    it('should return undefined if role is not found', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(rolesService, 'remove').mockResolvedValueOnce(undefined);

      const result = await controller.remove(id);
      expect(result).toBeUndefined();
      expect(rolesService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('getUsersWithRoleId', () => {
    it('should return users with a specific role ID', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(rolesService, 'getUsersWithRoleId')
        .mockResolvedValueOnce(mockRole);

      const result = await controller.getUsersWithRoleId(id);
      expect(result).toEqual(mockRole);
      expect(rolesService.getUsersWithRoleId).toHaveBeenCalledWith(id);
    });

    it('should return undefined if role is not found', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(rolesService, 'getUsersWithRoleId')
        .mockResolvedValueOnce(undefined);

      const result = await controller.getUsersWithRoleId(id);
      expect(result).toBeUndefined();
      expect(rolesService.getUsersWithRoleId).toHaveBeenCalledWith(id);
    });
  });
});
