import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { RoleModel } from '@modules/roles/models/role.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';
import { RoleType } from '@modules/users/role.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import { UserWithTenantsAndRoles } from './types/user.types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const generateMockUser = (id?: number): Omit<UserModel, 'password'> => {
  const user = new UserModel();

  user.id = id || faker.number.int({ min: 1, max: 1000 });
  user.email = faker.internet.email();
  user.name = faker.person.fullName();

  return user;
};

const generateMockUserWithTenants = (id?: number) => {
  const user = generateMockUser(id);
  const tenants = Array.from({ length: 2 }, () => {
    const tenant = new TenantModel();
    tenant.id = faker.number.int({ min: 1, max: 1000 });
    tenant.name = faker.company.name();
    return tenant;
  });
  return { ...user, tenants };
};

const generateMockUserWithRoles = (id?: number) => {
  const user = generateMockUser(id);
  const roles = Array.from({ length: 2 }, () => {
    const role = new RoleModel();
    role.id = faker.number.int({ min: 1, max: 1000 });
    role.name = faker.person.jobTitle();
    return role;
  });
  return { ...user, roles };
};

const generateMockUserWithTenantsAndRoles = (id?: number) => {
  const user = generateMockUser(id);
  const tenants = Array.from({ length: 2 }, () => {
    const tenant = new TenantModel();
    tenant.id = faker.number.int({ min: 1, max: 1000 });
    tenant.name = faker.company.name();
    return tenant;
  });
  const roles = Array.from({ length: 2 }, () => {
    const role = new RoleModel();
    role.id = faker.number.int({ min: 1, max: 1000 });
    role.name = faker.person.jobTitle();
    role.type = faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]);
    return {
      ...role,
      tenantId: faker.number.int({ min: 1, max: 1000 }),
    };
  });
  return { ...user, tenants, roles } as UserWithTenantsAndRoles;
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser = generateMockUser();
  const mockUsers = Array.from({ length: 5 }, generateMockUser);
  const mockUserWithTenants = generateMockUserWithTenants();
  const mockUserWithRoles = generateMockUserWithRoles();
  const mockUserWithTenantsAndRoles = generateMockUserWithTenantsAndRoles();

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(1),
    getUserWithTenants: jest.fn().mockResolvedValue(mockUserWithTenants),
    getUserWithRoles: jest.fn().mockResolvedValue(mockUserWithRoles),
    getUserWithTenantsAndRoles: jest
      .fn()
      .mockResolvedValue(mockUserWithTenantsAndRoles),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
      };

      const result = await usersController.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const result = await usersController.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });
      const mockedUser = generateMockUser(id);

      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(mockedUser);

      const result = await usersController.findOne(id);
      expect(result).toEqual(mockedUser);
      expect(usersService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user without a password', async () => {
      const updateUserDto: UpdateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });
      const expectedResult = generateMockUser(id);

      jest.spyOn(usersService, 'update').mockResolvedValueOnce(expectedResult);

      const result = await usersController.update(id, updateUserDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.update).toHaveBeenCalledWith(id, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user and return the removed user ID', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(usersService, 'remove').mockResolvedValueOnce(id);

      const result = await usersController.remove(id);
      expect(result).toBe(id);
      expect(usersService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithTenants', () => {
    it('should return a user with tenants without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(usersService, 'getUserWithTenants')
        .mockResolvedValueOnce(mockUserWithTenants);

      const result = await usersController.getUserWithTenants(id);
      expect(result).toEqual(mockUserWithTenants);
      expect(usersService.getUserWithTenants).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithRoles', () => {
    it('should return a user with roles without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(usersService, 'getUserWithRoles')
        .mockResolvedValueOnce(mockUserWithRoles);

      const result = await usersController.getUserWithRoles(id);
      expect(result).toEqual(mockUserWithRoles);
      expect(usersService.getUserWithRoles).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithTenantsAndRoles', () => {
    it('should return a user with tenants and roles without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(usersService, 'getUserWithTenantsAndRoles')
        .mockResolvedValueOnce(mockUserWithTenantsAndRoles);

      const result = await usersController.getUserWithTenantsAndRoles(id);
      expect(result).toEqual(mockUserWithTenantsAndRoles);
      expect(usersService.getUserWithTenantsAndRoles).toHaveBeenCalledWith(id);
    });
  });
});
