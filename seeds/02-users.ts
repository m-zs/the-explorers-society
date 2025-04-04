import 'tsconfig-paths/register';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { PasswordService } from '@core/services/password/password.service';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const passwordService = new PasswordService(new ConfigService());

  const users = await Promise.all([
    {
      name: 'admin',
      password: await passwordService.hashPassword('admin'),
      email: 'admin@admin.com',
    },
    ...Array.from({ length: 5 }, async () => {
      const name = faker.string.uuid();
      const password = await passwordService.hashPassword(name);
      return {
        name,
        email: faker.internet.email(),
        password,
      };
    }),
  ]);

  await knex('users').insert(users);

  console.log('Users seeded successfully');
}
