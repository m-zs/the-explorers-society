import 'tsconfig-paths/register';
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { RoleType } from '@modules/users/role.enum';

export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();

  const baseRoles = [
    { name: 'admin', type: RoleType.GLOBAL },
    { name: 'support', type: RoleType.GLOBAL },
    { name: 'user', type: RoleType.GLOBAL },
  ];

  const roles = [
    ...baseRoles,
    ...Array.from(new Array(5), () => ({
      name: faker.string.uuid(),
      type: faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]),
    })),
  ];

  await knex('roles').insert(roles);
}
