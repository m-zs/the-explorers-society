import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleType } from '@modules/users/role.enum';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

const generateMockRole = (id?: AppRole): RoleModel => {
  const role = new RoleModel();
  role.id = id || faker.helpers.arrayElement(Object.values(AppRole));
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
        type: RoleType.GLOBAL,
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
      const id = AppRole.ADMIN;
      const mockedRole = generateMockRole(id);

      jest.spyOn(rolesService, 'findOne').mockResolvedValueOnce(mockedRole);

      const result = await controller.findOne(id);
      expect(result).toEqual(mockedRole);
      expect(rolesService.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const id = AppRole.ADMIN;

      try {
        await controller.findOne(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        if (!(error instanceof NotFoundException)) return;
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Role not found');
      }
    });
  });

  describe('update', () => {
    it('should update a role and return the updated role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: faker.lorem.word(),
      };
      const id = AppRole.ADMIN;
      const expectedResult = generateMockRole(id);

      jest.spyOn(rolesService, 'update').mockResolvedValueOnce(expectedResult);

      const result = await controller.update(id, updateRoleDto);
      expect(result).toEqual(expectedResult);
      expect(rolesService.update).toHaveBeenCalledWith(id, updateRoleDto);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: faker.lorem.word(),
      };
      const id = AppRole.ADMIN;

      try {
        await controller.update(id, updateRoleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        if (!(error instanceof NotFoundException)) return;
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Role not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove a role and return the removed role ID', async () => {
      const id = AppRole.ADMIN;

      jest.spyOn(rolesService, 'remove').mockResolvedValueOnce(id);

      const result = await controller.remove(id);
      expect(result).toBe(id);
      expect(rolesService.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const id = AppRole.ADMIN;

      try {
        await controller.remove(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        if (!(error instanceof NotFoundException)) return;
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Role not found');
      }
    });
  });

  describe('getUsersWithRoleId', () => {
    it('should return users with a specific role ID', async () => {
      const id = AppRole.ADMIN;

      jest
        .spyOn(rolesService, 'getUsersWithRoleId')
        .mockResolvedValueOnce(mockRole);

      const result = await controller.getUsersWithRoleId(id);
      expect(result).toEqual(mockRole);
      expect(rolesService.getUsersWithRoleId).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const id = AppRole.ADMIN;

      try {
        await controller.getUsersWithRoleId(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        if (!(error instanceof NotFoundException)) return;
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Role not found');
      }
    });
  });
});
