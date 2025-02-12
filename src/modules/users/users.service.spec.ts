import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { PasswordService } from '@core/services/password/password.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

const generateMockUser = (id?: number): Omit<UserModel, 'password'> => {
  const user = new UserModel();

  user.id = id || faker.number.int({ min: 1, max: 1000 });
  user.email = faker.internet.email();
  user.name = faker.person.fullName();

  return user;
};

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;

  const mockUser = generateMockUser();
  const mockUsers = Array.from({ length: 5 }, generateMockUser);

  const mockUserRepository = {
    createUser: jest.fn().mockResolvedValue(mockUser),
    getAllUsers: jest.fn().mockResolvedValue(mockUsers),
    getUserById: jest.fn().mockResolvedValue(mockUser),
    updateUser: jest.fn().mockResolvedValue(mockUser),
    removeUser: jest.fn().mockResolvedValue(1),
    getUserWithTenants: jest.fn().mockResolvedValue(mockUser),
    getUserWithRoles: jest.fn().mockResolvedValue(mockUser),
    getUserWithTenantsAndRoles: jest.fn().mockResolvedValue(mockUser),
  };

  const mockPasswordService = {
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PasswordService, useValue: mockPasswordService },
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
  });

  describe('update', () => {
    it('should hash password if provided and update user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
      };
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValue('hashed-password');

      const result = await usersService.update(id, updateUserDto);

      expect(result).toBeDefined();
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        updateUserDto.password,
      );
      expect(userRepository.updateUser).toHaveBeenCalledWith(id, {
        ...updateUserDto,
        password: 'hashed-password',
      });
    });

    it('should update user without hashing if no password is provided', async () => {
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
        .mockResolvedValueOnce(mockUser);

      const result = await usersService.getUserWithTenants(id);
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserWithTenants).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithRoles', () => {
    it('should return a user with roles without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithRoles')
        .mockResolvedValueOnce(mockUser);

      const result = await usersService.getUserWithRoles(id);
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserWithRoles).toHaveBeenCalledWith(id);
    });
  });

  describe('getUserWithTenantsAndRoles', () => {
    it('should return a user with tenants and roles without a password', async () => {
      const id = faker.number.int({ min: 1, max: 1000 });

      jest
        .spyOn(userRepository, 'getUserWithTenantsAndRoles')
        .mockResolvedValueOnce(mockUser);

      const result = await usersService.getUserWithTenantsAndRoles(id);
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserWithTenantsAndRoles).toHaveBeenCalledWith(
        id,
      );
    });
  });
});
