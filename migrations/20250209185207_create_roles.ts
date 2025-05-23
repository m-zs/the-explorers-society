import 'tsconfig-paths/register';
import { Knex } from 'knex';

import { AppRole } from '@modules/auth/enums/app-role.enum';
import { RoleType } from '@modules/users/role.enum';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('roles', (table) => {
    table.enum('id', Object.values(AppRole)).primary();
    table.string('name').notNullable().unique();
    table.enu('type', Object.values(RoleType)).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('roles');
}
