import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PasswordService } from '@core/services/password/password.service';
import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleModel } from '@modules/roles/models/role.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';
import { TenantsService } from '@modules/tenants/tenants.service';
import { RoleType } from '@modules/users/role.enum';

import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import { UserWithTenantsAndRoles } from './types/user.types';
import { UserRepository } from './users.repository';
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
    role.id = faker.helpers.arrayElement(Object.values(AppRole));
    role.name = faker.person.jobTitle();
    role.type = faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]);
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
    role.id = faker.helpers.arrayElement(Object.values(AppRole));
    role.name = faker.person.jobTitle();
    role.type = faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]);
    return role;
  });
  return { ...user, tenants, roles } as UserWithTenantsAndRoles;
};

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;

  const mockUser = generateMockUser();
  const mockUsers = Array.from({ length: 5 }, generateMockUser);
  const mockUserWithTenants = generateMockUserWithTenants();
  const mockUserWithRoles = generateMockUserWithRoles();
  const mockUserWithTenantsAndRoles = generateMockUserWithTenantsAndRoles();

  const mockUserRepository = {
    createUser: jest.fn().mockResolvedValue(mockUser),
    getAllUsers: jest.fn().mockResolvedValue(mockUsers),
    getUserById: jest.fn().mockResolvedValue(mockUser),
    updateUser: jest.fn().mockResolvedValue(mockUser),
    removeUser: jest.fn().mockResolvedValue(1),
    getUserWithTenants: jest.fn().mockResolvedValue(mockUserWithTenants),
    getUserWithRoles: jest.fn().mockResolvedValue(mockUserWithRoles),
    getUserWithTenantsAndRoles: jest
      .fn()
      .mockResolvedValue(mockUserWithTenantsAndRoles),
    findByTenantId: jest.fn().mockResolvedValue(mockUsers.slice(0, 2)),
    getUserByIdWithPassword: jest.fn().mockResolvedValue(mockUser),
    updateUserPassword: jest.fn().mockResolvedValue(mockUser),
  };

  const mockPasswordService = {
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    comparePassword: jest.fn().mockResolvedValue(true),
  };

  const mockTenantsService = {
    getTenantById: jest.fn().mockResolvedValue(new TenantModel()),
    findOne: jest.fn().mockResolvedValue(new TenantModel()),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TenantsService, useValue: mockTenantsService },
        UsersService,
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  describe('create', () => {
    it('should hash the password and create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
      };

      const result = await usersService.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
    });

    it('should create a user with a valid tenant', async () => {
      const createUserDto: CreateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
        tenantId: faker.number.int({ min: 1, max: 1000 }),
      };
      const tenant = new TenantModel();
      tenant.id = createUserDto.tenantId!;

      jest.spyOn(mockTenantsService, 'findOne').mockResolvedValueOnce(tenant);

      const result = await usersService.create(createUserDto);

      expect(mockTenantsService.findOne).toHaveBeenCalledWith(
        createUserDto.tenantId,
      );
      expect(result).toEqual(mockUser);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
    });

    it('should throw BadRequestException for invalid tenant', async () => {
      const createUserDto: CreateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
        tenantId: faker.number.int({ min: 1, max: 1000 }),
      };

      jest
        .spyOn(mockTenantsService, 'findOne')
        .mockRejectedValueOnce(new Error());

      await expect(usersService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const result = await usersService.findAll();
      expect(result).toEqual(mockUsers);
      expect(userRepository.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(userRepository, 'getUserById').mockResolvedValueOnce(mockUser);

      const result = await usersService.findOne(id);
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValueOnce(undefined);

      await expect(usersService.findOne(id)).rejects.toThrow(NotFoundException);
      expect(userRepository.getUserById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      const expectedResult = generateMockUser(id);

      jest
        .spyOn(userRepository, 'updateUser')
        .mockResolvedValueOnce(expectedResult);

      const result = await usersService.update(id, updateUserDto);
      expect(result).toEqual(expectedResult);
      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.updateUser).toHaveBeenCalledWith(id, updateUserDto);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(userRepository, 'updateUser').mockResolvedValueOnce(undefined);

      await expect(usersService.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.updateUser).toHaveBeenCalledWith(id, updateUserDto);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: faker.internet.password(),
        newPassword: faker.internet.password(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      const userWithPassword = {
        ...mockUser,
        password: 'hashed-current-password',
      };

      jest
        .spyOn(userRepository, 'getUserByIdWithPassword')
        .mockResolvedValueOnce(userWithPassword);
      jest
        .spyOn(passwordService, 'comparePassword')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValueOnce('hashed-new-password');
      jest
        .spyOn(userRepository, 'updateUserPassword')
        .mockResolvedValueOnce(userWithPassword);

      const result = await usersService.changePassword(id, changePasswordDto);

      expect(result).toEqual(userWithPassword);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        changePasswordDto.password,
        userWithPassword.password,
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
      );
      expect(userRepository.updateUserPassword).toHaveBeenCalledWith(
        id,
        'hashed-new-password',
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: faker.internet.password(),
        newPassword: faker.internet.password(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserByIdWithPassword')
        .mockResolvedValueOnce(undefined);

      await expect(
        usersService.changePassword(id, changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: faker.internet.password(),
        newPassword: faker.internet.password(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      const userWithPassword = {
        ...mockUser,
        password: 'hashed-current-password',
      };

      jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValueOnce(userWithPassword);
      jest
        .spyOn(passwordService, 'comparePassword')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(userRepository, 'getUserByIdWithPassword')
        .mockResolvedValueOnce(userWithPassword);

      await expect(
        usersService.changePassword(id, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a user and return the deleted user ID', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(userRepository, 'removeUser').mockResolvedValueOnce(id);

      const result = await usersService.remove(id);
      expect(result).toBe(id);
      expect(userRepository.removeUser).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithTenants', () => {
    it('should return a user with tenants without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithTenants')
        .mockResolvedValueOnce(mockUserWithTenants);

      const result = await usersService.getUserWithTenants(id);
      expect(result).toEqual(mockUserWithTenants);
      expect(userRepository.getUserWithTenants).toHaveBeenCalledWith(id);
    });

    it('should return undefined for non-existent user', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithTenants')
        .mockResolvedValueOnce(undefined);

      const result = await usersService.getUserWithTenants(id);
      expect(result).toBeUndefined();
      expect(userRepository.getUserWithTenants).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithRoles', () => {
    it('should return a user with roles without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithRoles')
        .mockResolvedValueOnce(mockUserWithRoles);

      const result = await usersService.getUserWithRoles(id);
      expect(result).toEqual(mockUserWithRoles);
      expect(userRepository.getUserWithRoles).toHaveBeenCalledWith(id);
    });

    it('should return undefined for non-existent user', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithRoles')
        .mockResolvedValueOnce(undefined);

      const result = await usersService.getUserWithRoles(id);
      expect(result).toBeUndefined();
      expect(userRepository.getUserWithRoles).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithTenantsAndRoles', () => {
    it('should return a user with tenants and roles without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithTenantsAndRoles')
        .mockResolvedValueOnce(mockUserWithTenantsAndRoles);

      const result = await usersService.getUserWithTenantsAndRoles(id);
      expect(result).toEqual(mockUserWithTenantsAndRoles);
      expect(userRepository.getUserWithTenantsAndRoles).toHaveBeenCalledWith(
        id,
      );
    });

    it('should return undefined for non-existent user', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithTenantsAndRoles')
        .mockResolvedValueOnce(undefined);

      const result = await usersService.getUserWithTenantsAndRoles(id);
      expect(result).toBeUndefined();
      expect(userRepository.getUserWithTenantsAndRoles).toHaveBeenCalledWith(
        id,
      );
    });
  });

  describe('findByTenantId', () => {
    it('should return users for a specific tenant', async () => {
      const tenantId = faker.number.int({ min: 1, max: 1000 });
      const tenantUsers = mockUsers.slice(0, 2);

      jest
        .spyOn(userRepository, 'findByTenantId')
        .mockResolvedValueOnce(tenantUsers);

      const result = await usersService.findByTenantId(tenantId);
      expect(result).toEqual(tenantUsers);
      expect(userRepository.findByTenantId).toHaveBeenCalledWith(tenantId);
    });

    it('should return empty array for tenant with no users', async () => {
      const tenantId = faker.number.int({ min: 1, max: 1000 });

      jest.spyOn(userRepository, 'findByTenantId').mockResolvedValueOnce([]);

      const result = await usersService.findByTenantId(tenantId);
      expect(result).toEqual([]);
      expect(userRepository.findByTenantId).toHaveBeenCalledWith(tenantId);
    });
  });
});
