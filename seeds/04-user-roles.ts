import 'tsconfig-paths/register';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';

import {
  testTenantAdmin,
  testTenantSupport,
  testTenantUser,
} from '@/test/data/users';
import { PasswordService } from '@core/services/password/password.service';
import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleModel } from '@modules/roles/models/role.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';
import { UserModel } from '@modules/users/models/user.model';

export async function seed(knex: Knex): Promise<void> {
  await knex('tenant_roles').del();

  const passwordService = new PasswordService(new ConfigService());

  // Get all roles
  const roles = await knex<RoleModel>('roles').select('*');

  // Create test tenant
  const [testTenant] = await knex<TenantModel>('tenants')
    .insert({
      name: 'Test Tenant',
      domain: 'test.tenant.com',
    })
    .returning('*');

  const adminRole = roles.find((r) => r.id === AppRole.ADMIN);
  const supportRole = roles.find((r) => r.id === AppRole.SUPPORT);
  const userRole = roles.find((r) => r.id === AppRole.USER);

  // Create test users for the test tenant
  const testUsers = await knex<UserModel>('users')
    .insert([
      {
        ...testTenantAdmin,
        password: await passwordService.hashPassword(testTenantAdmin.password),
        tenant_id: testTenant.id,
      },
      {
        ...testTenantSupport,
        password: await passwordService.hashPassword(
          testTenantSupport.password,
        ),
        tenant_id: testTenant.id,
      },
      {
        ...testTenantUser,
        password: await passwordService.hashPassword(testTenantUser.password),
        tenant_id: testTenant.id,
      },
    ])
    .returning('*');

  // Assign global USER role to all test users (with tenant_id as NULL)
  for (const user of testUsers) {
    if (userRole) {
      await knex('tenant_roles').insert({
        user_id: user.id,
        role_id: userRole.id,
        tenant_id: null, // Global role
      });
    }
  }

  if (testTenant) {
    // Assign tenant admin role
    if (adminRole) {
      await knex('tenant_roles').insert({
        tenant_id: testTenant.id,
        user_id: testUsers[0].id, // testTenantAdmin
        role_id: adminRole.id,
      });
    }

    if (supportRole) {
      await knex('tenant_roles').insert({
        tenant_id: testTenant.id,
        user_id: testUsers[1].id, // testTenantSupport
        role_id: supportRole.id,
      });
    }

    if (userRole) {
      await knex('tenant_roles').insert({
        tenant_id: testTenant.id,
        user_id: testUsers[2].id, // testTenantUser
        role_id: userRole.id,
      });
    }
  }

  console.log('Test tenant and users with roles seeded successfully');
}
