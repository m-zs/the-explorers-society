import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class LogService implements LoggerService {
  log(message: string, context?: string) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`, context);
  }

  error(message: string, trace: string, context?: string) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, context);
    console.error(trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context);
  }

  debug(message: string, context?: string) {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, context);
  }

  verbose(message: string, context?: string) {
    console.log(`[VERBOSE] ${new Date().toISOString()} - ${message}`, context);
  }
}
