import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('tenants').del();

  const tenants = Array.from(new Array(5), () => ({
    name: faker.company.name(),
    domain: faker.internet.url(),
  }));

  await knex('tenants').insert(tenants);

  console.log('Tenants seeded successfully');
}
