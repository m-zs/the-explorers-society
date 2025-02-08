import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';

import { TenantRepository } from '../tenants.repository';

interface BasicCommandOptions {
  number?: number;
}

@Command({ name: 'tenants-seed' })
@Injectable()
export class TenantsSeedCommand extends CommandRunner {
  constructor(private readonly tenantRepository: TenantRepository) {
    super();
  }

  @Option({
    flags: '-n, --number <number>',
    description: 'Number of tenants to generate',
    defaultValue: 5,
  })
  parseNumber(number: string) {
    return parseInt(number, 10);
  }

  async run(
    _passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    const tenants = Array.from(new Array(options?.number), () => ({
      name: faker.company.name(),
      domain: faker.internet.url(),
    }));

    await this.tenantRepository.createTenants(tenants);

    console.log('Tenants:', tenants);
  }
}
