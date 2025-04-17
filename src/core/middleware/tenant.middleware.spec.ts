import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

import { TenantMiddleware } from './tenant.middleware';

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new TenantMiddleware();
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw BadRequestException if no tenant ID is provided', () => {
    expect(() => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if tenant ID is not a number', () => {
    mockRequest.headers = {
      'x-tenant-id': 'not-a-number',
    };

    expect(() => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );
    }).toThrow(BadRequestException);
  });

  it('should set tenantId in request and call next if valid tenant ID is provided', () => {
    const tenantId = faker.number.int();
    mockRequest.headers = {
      'x-tenant-id': tenantId.toString(),
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest['tenantId']).toBe(tenantId);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle tenant ID as string and convert it to number', () => {
    const tenantId = faker.number.int();
    mockRequest.headers = {
      'x-tenant-id': tenantId.toString(),
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest['tenantId']).toBe(tenantId);
    expect(typeof mockRequest['tenantId']).toBe('number');
  });

  it('should handle tenant ID with leading/trailing spaces', () => {
    const tenantId = faker.number.int();
    mockRequest.headers = {
      'x-tenant-id': ` ${tenantId} `,
    };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest['tenantId']).toBe(tenantId);
  });
});
