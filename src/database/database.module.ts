import { Global, Logger, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Knex from 'knex';
import { knexSnakeCaseMappers, Model } from 'objection';

const logger = new Logger('DatabaseModule');

const models = [];

const modelProviders: Provider[] = models.map((model) => ({
  provide: model,
  useValue: model,
}));

const providers: Provider[] = [
  ...modelProviders,
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
];

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class DatabaseModule {}
