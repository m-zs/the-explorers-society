import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tenant_roles', (table) => {
    table.increments('id').primary();
    table
      .integer('tenant_id')
      .unsigned()
      .notNullable()
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
      .integer('role_id')
      .unsigned()
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
