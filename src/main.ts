import { Logger as CoreLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LogService } from '@core/logging/log.service';
import { setupOpenApi } from '@core/open-api/setup-open-api';
import { exceptionFactory } from '@core/validation/exception.factory';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // logging
  const logger = app.get(LogService);
  CoreLogger.overrideLogger(logger);

  // global validators
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory,
    }),
  );

  // open API
  setupOpenApi(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
