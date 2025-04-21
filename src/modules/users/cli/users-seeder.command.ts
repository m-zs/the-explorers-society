import { faker } from '@faker-js/faker';
import { Command, CommandRunner, Option } from 'nest-commander';

import { UsersService } from '../users.service';

@Command({ name: 'users-seed' })
export class UsersSeedCommand extends CommandRunner {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Option({
    flags: '-n, --number <number>',
    description: 'Number of users to generate',
    defaultValue: 5,
  })
  parseNumber(number: string) {
    return parseInt(number, 10);
  }

  async run(
    _passedParam: string[],
    options?: { number?: number },
  ): Promise<void> {
    const users = await Promise.all(
      Array.from({ length: options?.number ?? 5 }, async () => {
        return this.usersService.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          tenantId: null,
        });
      }),
    );

    console.log('Generated Users:', users);
  }
}
