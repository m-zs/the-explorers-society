import { Logger as CoreLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { LogService } from '@core/logging/log.service';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(LogService);
  CoreLogger.overrideLogger(logger);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
