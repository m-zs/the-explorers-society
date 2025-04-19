import 'tsconfig-paths/register';
import { Knex } from 'knex';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleType } from '@modules/users/role.enum';

export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();

  const baseRoles = [
    { name: AppRole.ADMIN, type: RoleType.GLOBAL, id: AppRole.ADMIN },
    { name: AppRole.SUPPORT, type: RoleType.GLOBAL, id: AppRole.SUPPORT },
    { name: AppRole.USER, type: RoleType.GLOBAL, id: AppRole.USER },
  ];

  const roles = [...baseRoles];

  await knex('roles').insert(roles);

  console.log('Roles seeded successfully');
}
