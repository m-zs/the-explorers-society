import * as request from 'supertest';

export const getTypedResponse = <T>(
  res: Awaited<request.Response>,
): Omit<Awaited<request.Response>, 'body'> & { body: T } => res;
