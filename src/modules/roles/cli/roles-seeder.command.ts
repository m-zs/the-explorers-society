import { faker } from '@faker-js/faker';
import { Command, CommandRunner, Option } from 'nest-commander';

import { RolesService } from '@modules/roles/roles.service';
import { RoleType } from '@modules/users/role.enum';

@Command({ name: 'roles-seed' })
export class RolesSeedCommand extends CommandRunner {
  constructor(private readonly rolesService: RolesService) {
    super();
  }

  @Option({
    flags: '-n, --number <number>',
    description: 'Number of roles to generate',
    defaultValue: 5,
  })
  parseNumber(number: string) {
    return parseInt(number, 10);
  }

  async run(
    _passedParam: string[],
    options?: { number?: number },
  ): Promise<void> {
    const roles = await Promise.all(
      Array.from({ length: options?.number ?? 5 }, async () => {
        return this.rolesService.create({
          name: faker.word.noun(),
          type: faker.helpers.arrayElement([RoleType.GLOBAL, RoleType.TENANT]),
        });
      }),
    );

    console.log('Generated Roles:', roles);
  }
}
