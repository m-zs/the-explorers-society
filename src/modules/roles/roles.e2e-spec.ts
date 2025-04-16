import { execSync } from 'child_process';

import { faker } from '@faker-js/faker';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { RoleType } from '@modules/users/role.enum';
import { getTypedResponse } from '@utils/test/getTypedResponse';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleModel } from './models/role.model';

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let server: App;
  let createdRoleId: number;
  const tenantId = faker.number.int();

  beforeAll(async () => {
    execSync('cross-env NODE_ENV=test knex migrate:rollback --all', {
      stdio: 'inherit',
    });
    execSync('cross-env NODE_ENV=test knex migrate:latest', {
      stdio: 'inherit',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /roles', () => {
    it('should create a new role', async () => {
      const roleData: CreateRoleDto = {
        name: 'Test Role',
        type: RoleType.GLOBAL,
      };

      const response = await request(server)
        .post('/roles')
        .set('x-tenant-id', tenantId.toString())
        .send(roleData);
      const typedResponse = getTypedResponse<RoleModel>(response);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(typedResponse.body).toHaveProperty('id');
      expect(typedResponse.body.name).toBe(roleData.name);
      expect(typedResponse.body.type).toBe(roleData.type);

      createdRoleId = typedResponse.body.id;
    });

    it('should return 400 if missing required fields', async () => {
      const invalidData = { name: '' }; // Invalid name

      await request(server)
        .post('/roles')
        .set('x-tenant-id', tenantId.toString())
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if type is invalid', async () => {
      const invalidData = { name: faker.lorem.word(), type: 'INVALID' }; // Invalid type

      await request(server)
        .post('/roles')
        .set('x-tenant-id', tenantId.toString())
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if name is too long', async () => {
      const invalidData = {
        name: faker.lorem.words(21),
        type: RoleType.GLOBAL,
      };

      await request(server)
        .post('/roles')
        .set('x-tenant-id', tenantId.toString())
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /roles', () => {
    it('should return all roles', async () => {
      const response = await request(server)
        .get('/roles')
        .set('x-tenant-id', tenantId.toString());
      const typedResponse = getTypedResponse<RoleModel[]>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(typedResponse.body)).toBe(true);
      expect(typedResponse.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return a role by ID', async () => {
      const response = await request(server)
        .get(`/roles/${createdRoleId}`)
        .set('x-tenant-id', tenantId.toString());
      const typedResponse = getTypedResponse<RoleModel>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(typedResponse.body.id).toBe(createdRoleId);
      expect(typedResponse.body.name).toBe('Test Role');
    });

    it('should return 404 if role not found', async () => {
      await request(server)
        .get('/roles/9999')
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 if the ID is not a valid number', async () => {
      await request(server)
        .get('/roles/invalid-id')
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /roles/:id', () => {
    it('should update a role', async () => {
      const updateData: UpdateRoleDto = { name: 'Updated Role' };

      const response = await request(server)
        .patch(`/roles/${createdRoleId}`)
        .set('x-tenant-id', tenantId.toString())
        .send(updateData);
      const typedResponse = getTypedResponse<RoleModel>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(typedResponse.body.id).toBe(createdRoleId);
      expect(typedResponse.body.name).toBe(updateData.name);
    });

    it('should return 404 if role not found', async () => {
      await request(server)
        .patch('/roles/9999')
        .set('x-tenant-id', tenantId.toString())
        .send({ name: 'Nonexistent Role' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 if trying to update with invalid data', async () => {
      const invalidUpdateData = { name: faker.lorem.words(20) }; // Invalid name length

      await request(server)
        .patch(`/roles/${createdRoleId}`)
        .set('x-tenant-id', tenantId.toString())
        .send(invalidUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /roles/:id/users', () => {
    it('should return users with a specific role', async () => {
      const response = await request(server)
        .get(`/roles/${createdRoleId}/users`)
        .set('x-tenant-id', tenantId.toString());
      const typedResponse = getTypedResponse<RoleModel>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(typedResponse.body).toHaveProperty('id');
    });

    it('should return 404 if role not found', async () => {
      await request(server)
        .get('/roles/9999/users')
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should delete a role', async () => {
      await request(server)
        .delete(`/roles/${createdRoleId}`)
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.NO_CONTENT);

      await request(server)
        .get(`/roles/${createdRoleId}`)
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 if role not found', async () => {
      await request(server)
        .delete('/roles/9999')
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 if ID is invalid', async () => {
      await request(server)
        .delete('/roles/invalid-id')
        .set('x-tenant-id', tenantId.toString())
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
