import request from 'supertest';
import { getConnection, Connection } from 'typeorm';

import app from '../../src/app';
import createConnection from '../../src/database/typeorm';

jest.mock('../../src/config/security', () => ({
  duration: 100,
  points: 1,
}));

describe('RateLimit', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection('test-connection');
    await connection.runMigrations();
  });
  afterAll(async () => {
    const mainConnection = getConnection();

    await connection.close();
    await mainConnection.close();
  });

  it('should not be able to consume after many requests', async () => {
    const requests: request.Test[] = [];

    Array.from(Array(5).keys()).forEach(() => {
      requests.push(request(app).get('/v1/'));
    });

    const responses = await Promise.all(requests);
    const response = responses.pop();

    expect(response?.status).toBe(429);
    expect(response?.body).toStrictEqual({
      status: 'error',
      message: 'Too Many Requests',
      code: 229,
      docs: process.env.DOCS_URL,
    });
  });
});
