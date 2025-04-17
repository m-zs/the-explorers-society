import { execSync } from 'child_process';

import { faker } from '@faker-js/faker';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { admin, user } from '@/test/data/users';
import { getTypedResponse } from '@/utils/test/getTypedResponse';

import { REFRESH_TOKEN_COOKIE_NAME } from './constants/cookie-options.constant';
import { SignInDto } from './dto/sign-in.dto';
import { TokenResponseDto } from './dto/token-response.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: App;
  const tenantId = faker.number.int();

  beforeAll(async () => {
    jest.setTimeout(30000);

    execSync('cross-env NODE_ENV=test knex migrate:rollback --all', {
      stdio: 'inherit',
    });
    execSync('cross-env NODE_ENV=test knex migrate:latest', {
      stdio: 'inherit',
    });
    execSync('cross-env NODE_ENV=test knex seed:run', {
      stdio: 'inherit',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as App;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    const signInDto: SignInDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      tenantId,
    };

    it('should return 401 for invalid credentials', async () => {
      const response = await request(server)
        .post('/auth/login')
        .set('x-tenant-id', tenantId.toString())
        .send(signInDto);
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(typedResponse.body).not.toHaveProperty('accessToken');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(server)
        .post('/auth/login')
        .set('x-tenant-id', tenantId.toString())
        .send({ ...signInDto, email: 'invalid-email' });
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(typedResponse.body).not.toHaveProperty('accessToken');
    });

    it('should return 400 for empty password', async () => {
      const response = await request(server)
        .post('/auth/login')
        .set('x-tenant-id', tenantId.toString())
        .send({ ...signInDto, password: '' });
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(typedResponse.body).not.toHaveProperty('accessToken');
    });

    it('should log in with admin credentials and set refresh token cookie', async () => {
      const response = await request(server)
        .post('/auth/login')
        .set('x-tenant-id', tenantId.toString())
        .send({ email: admin.email, password: admin.password, tenantId });
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(typedResponse.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(
        new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
      );
    });

    it('should log in with user credentials', async () => {
      const response = await request(server)
        .post('/auth/login')
        .set('x-tenant-id', tenantId.toString())
        .send({ email: user.email, password: user.password, tenantId });
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(typedResponse.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(
        new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 401 without refresh token', async () => {
      const response = await request(server)
        .post('/auth/refresh')
        .set('x-tenant-id', tenantId.toString());
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(typedResponse.body).not.toHaveProperty('accessToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(server)
        .post('/auth/refresh')
        .set('x-tenant-id', tenantId.toString())
        .set('Cookie', [`${REFRESH_TOKEN_COOKIE_NAME}=invalid-token`]);
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(typedResponse.body).not.toHaveProperty('accessToken');
    });

    it('should refresh tokens with valid refresh token', async () => {
      // First, log in to get a valid refresh token
      const loginResponse = await request(server)
        .post('/auth/login')
        .set('x-tenant-id', tenantId.toString())
        .send({ email: admin.email, password: admin.password, tenantId });

      const cookies = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const refreshTokenCookie = cookies.find((cookie) =>
        cookie.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`),
      );

      if (!refreshTokenCookie) {
        throw new Error('No refresh token cookie found in login response');
      }

      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      // Then use the refresh token to get new tokens
      const response = await request(server)
        .post('/auth/refresh')
        .set('x-tenant-id', tenantId.toString())
        .set('Cookie', [`${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`]);
      const typedResponse = getTypedResponse<TokenResponseDto>(response);

      expect(response.status).toBe(HttpStatus.OK);
      expect(typedResponse.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(
        new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=`),
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear refresh token cookie', async () => {
      const response = await request(server)
        .post('/auth/logout')
        .set('x-tenant-id', tenantId.toString());

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(
        new RegExp(`${REFRESH_TOKEN_COOKIE_NAME}=;`),
      );
    });
  });
});
