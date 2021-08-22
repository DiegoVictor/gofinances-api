import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import { errors } from 'celebrate';
import swagger from 'swagger-ui-express';

import swaggerDocument from './swagger.json';
import routes from './routes';
import AppError from './errors/AppError';

import createConnection from './database/typeorm';

createConnection();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/docs', swagger.serve, swagger.setup(swaggerDocument));
app.use('/v1/', routes);

app.use(errors());
app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...err.data,
      docs: process.env.DOCS_URL,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
    docs: process.env.DOCS_URL,
  });
});

export default app;
