import faker from 'faker';

import AppError from '../../src/errors/AppError';

describe('AppError', () => {
  it('should be able to return an error with default status code', () => {
    const message = faker.lorem.sentence();
    const data = {
      code: faker.random.number(),
    };

    const error = new AppError(message, data);

    expect(error).toMatchObject({
      message,
      data,
      statusCode: 400,
    });
  });

  it('should be able to return an error with custom status code', () => {
    const message = faker.lorem.sentence();
    const statusCode = faker.random.number();
    const data = {
      code: faker.random.number(),
    };

    const error = new AppError(message, data, statusCode);

    expect(error).toMatchObject({
      message,
      data,
      statusCode,
    });
  });
});
