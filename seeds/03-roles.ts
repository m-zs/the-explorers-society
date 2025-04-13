import 'tsconfig-paths/register';
import { Knex } from 'knex';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { TenantRole } from '@modules/auth/enums/tenant-role.enum';
import { RoleType } from '@modules/users/role.enum';

export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();

  const baseRoles = [
    { name: AppRole.ADMIN, type: RoleType.GLOBAL },
    { name: AppRole.SUPPORT, type: RoleType.GLOBAL },
    { name: AppRole.USER, type: RoleType.GLOBAL },
    { name: TenantRole.ADMIN, type: RoleType.TENANT },
    { name: TenantRole.SUPPORT, type: RoleType.TENANT },
    { name: TenantRole.USER, type: RoleType.TENANT },
  ];

  const roles = [...baseRoles];

  await knex('roles').insert(roles);

  console.log('Roles seeded successfully');
}
