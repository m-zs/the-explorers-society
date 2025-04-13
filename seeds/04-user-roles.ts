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
import { TenantRole } from '@modules/auth/enums/tenant-role.enum';
import { RoleModel } from '@modules/roles/models/role.model';
import { TenantModel } from '@modules/tenants/models/tenant.model';
import { UserModel } from '@modules/users/models/user.model';
import { RoleType } from '@modules/users/role.enum';

export async function seed(knex: Knex): Promise<void> {
  await knex('tenant_roles').del();

  const passwordService = new PasswordService(new ConfigService());

  // Get all roles
  const roles = await knex<RoleModel>('roles').select('*');
  const globalUserRole = roles.find(
    (r) => r.name === (AppRole.USER as string) && r.type === RoleType.GLOBAL,
  );

  // Create test tenant
  const [testTenant] = await knex<TenantModel>('tenants')
    .insert({
      name: 'Test Tenant',
      domain: 'test.tenant.com',
    })
    .returning('*');

  const tenantAdminRole = roles.find(
    (r) =>
      r.name === (TenantRole.ADMIN as string) && r.type === RoleType.TENANT,
  );
  const tenantSupportRole = roles.find(
    (r) =>
      r.name === (TenantRole.SUPPORT as string) && r.type === RoleType.TENANT,
  );
  const tenantUserRole = roles.find(
    (r) => r.name === (TenantRole.USER as string) && r.type === RoleType.TENANT,
  );

  // Create test users for the test tenant
  const testUsers = await knex<UserModel>('users')
    .insert([
      {
        ...testTenantAdmin,
        password: await passwordService.hashPassword(testTenantAdmin.password),
      },
      {
        ...testTenantSupport,
        password: await passwordService.hashPassword(
          testTenantSupport.password,
        ),
      },
      {
        ...testTenantUser,
        password: await passwordService.hashPassword(testTenantUser.password),
      },
    ])
    .returning('*');

  // Assign global USER role to all test users (with tenant_id as NULL)
  for (const user of testUsers) {
    if (globalUserRole) {
      await knex('tenant_roles').insert({
        user_id: user.id,
        role_id: globalUserRole.id,
        tenant_id: null, // Global role
      });
    }
  }

  if (testTenant) {
    // Assign tenant admin role
    if (tenantAdminRole) {
      await knex('tenant_roles').insert({
        tenant_id: testTenant.id,
        user_id: testUsers[0].id, // testTenantAdmin
        role_id: tenantAdminRole.id,
      });
    }

    if (tenantSupportRole) {
      await knex('tenant_roles').insert({
        tenant_id: testTenant.id,
        user_id: testUsers[1].id, // testTenantSupport
        role_id: tenantSupportRole.id,
      });
    }

    if (tenantUserRole) {
      await knex('tenant_roles').insert({
        tenant_id: testTenant.id,
        user_id: testUsers[2].id, // testTenantUser
        role_id: tenantUserRole.id,
      });
    }
  }

  console.log('Test tenant and users with roles seeded successfully');
}
