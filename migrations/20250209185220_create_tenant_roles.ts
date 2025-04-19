import 'tsconfig-paths/register';
import { Knex } from 'knex';

import { AppRole } from '@modules/auth/enums/app-role.enum';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tenant_roles', (table) => {
    table.increments('id').primary();
    table
      .integer('tenant_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .enum('role_id', Object.values(AppRole))
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE');
    table.timestamps(true, true);

    table.unique(['tenant_id', 'user_id', 'role_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tenant_roles');
}
