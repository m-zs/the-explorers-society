import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  Provider,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Knex, { Knex as KnexType } from 'knex';
import { knexSnakeCaseMappers, Model } from 'objection';

import { TenantModel } from '@modules/tenants/models/tenant.model';

const logger = new Logger('DatabaseModule');

const models: Provider[] = [
  {
    provide: 'TenantModel',
    useValue: TenantModel,
  },
];

const providers: Provider[] = [
  {
    provide: 'KnexConnection',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const knex = Knex({
        client: 'pg',
        connection: configService.get<string>('DATABASE_URL'),
        debug: configService.get<string>('KNEX_DEBUG') === 'true',
        ...knexSnakeCaseMappers(),
      });

      try {
        await knex.raw('SELECT 1+1 AS result');
        logger.log('✅ Database connected successfully');
      } catch (error) {
        logger.error('Database connection failed', error);
        process.exit(1);
      }

      Model.knex(knex);
      return knex;
    },
  },
  ...models,
];

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [...providers],
  exports: [...providers],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject('KnexConnection') private knex: KnexType) {}

  async onModuleDestroy() {
    if (this.knex) {
      await this.knex.destroy();
      logger.log('✅ Database connection closed successfully');
    }
  }
}
