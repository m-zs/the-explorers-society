import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleType } from '@modules/users/role.enum';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';
import { RoleRepository } from './roles.repository';
import { RolesService } from './roles.service';

const generateMockRole = (id?: AppRole): RoleModel => {
  const role = new RoleModel();
  role.id = id || faker.helpers.arrayElement(Object.values(AppRole));
  role.name = faker.word.noun();
  role.type = faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]);
  return role;
};

describe('RolesService', () => {
  let rolesService: RolesService;
  let roleRepository: RoleRepository;

  const mockRole = generateMockRole();
  const mockRoles = Array.from({ length: 5 }, () => generateMockRole());

  const mockRoleRepository = {
    createRole: jest.fn().mockResolvedValue(mockRole),
    getAllRoles: jest.fn().mockResolvedValue(mockRoles),
    getRoleById: jest.fn().mockResolvedValue(mockRole),
    updateRole: jest.fn().mockResolvedValue(mockRole),
    removeRole: jest.fn().mockResolvedValue(1),
    getUsersWithRoleId: jest.fn().mockResolvedValue(mockRole),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: RoleRepository, useValue: mockRoleRepository },
        RolesService,
      ],
    }).compile();

    rolesService = module.get<RolesService>(RolesService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: faker.word.noun(),
        type: faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]),
      };

      const result = await rolesService.create(createRoleDto);
      expect(result).toEqual(mockRole);
      expect(roleRepository.createRole).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const result = await rolesService.findAll();
      expect(result).toEqual(mockRoles);
      expect(roleRepository.getAllRoles).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single role by ID', async () => {
      const id = AppRole.ADMIN;

      jest.spyOn(roleRepository, 'getRoleById').mockResolvedValueOnce(mockRole);

      const result = await rolesService.findOne(id);
      expect(result).toEqual(mockRole);
      expect(roleRepository.getRoleById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        name: faker.word.noun(),
        type: faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]),
      };
      const id = AppRole.ADMIN;

      jest.spyOn(roleRepository, 'updateRole').mockResolvedValueOnce(mockRole);

      const result = await rolesService.update(id, updateRoleDto);
      expect(result).toEqual(mockRole);
      expect(roleRepository.updateRole).toHaveBeenCalledWith(id, updateRoleDto);
    });
  });

  describe('remove', () => {
    it('should remove a role and return the deleted role ID', async () => {
      const id = AppRole.ADMIN;

      jest.spyOn(roleRepository, 'removeRole').mockResolvedValueOnce(id);

      const result = await rolesService.remove(id);
      expect(result).toBe(id);
      expect(roleRepository.removeRole).toHaveBeenCalledWith(id);
    });
  });

  describe('getUsersWithRoleId', () => {
    it('should return users associated with the role', async () => {
      const id = AppRole.ADMIN;

      jest
        .spyOn(roleRepository, 'getUsersWithRoleId')
        .mockResolvedValueOnce(mockRole);

      const result = await rolesService.getUsersWithRoleId(id);
      expect(result).toEqual(mockRole);
      expect(roleRepository.getUsersWithRoleId).toHaveBeenCalledWith(id);
    });
  });
});
