import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UniqueViolationError } from 'objection';

@Catch(UniqueViolationError)
export class UniqueViolationExceptionFilter implements ExceptionFilter {
  catch(
    _exception: InstanceType<typeof UniqueViolationError>,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Given value combination already exists.',
      error: 'Bad Request',
    });
  }
}
