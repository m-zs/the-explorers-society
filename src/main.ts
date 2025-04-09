import { Logger as CoreLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LogService } from '@core/logging/log.service';
import { setupOpenApi } from '@core/open-api/setup-open-api';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // logging
  const logger = app.get(LogService);
  CoreLogger.overrideLogger(logger);

  // open API
  setupOpenApi(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
