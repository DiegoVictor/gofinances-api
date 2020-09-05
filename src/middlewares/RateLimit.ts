import { Request, Response, NextFunction } from 'express';

import { RateLimiter } from '../database/redis';
import config from '../config/security';
import AppError from '../errors/AppError';

const limiter = RateLimiter({
  duration: config.duration,
  points: config.points,
});

export default async (
  request: Request,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await limiter.consume(request.ip);
    next();
  } catch (err) {
    throw new AppError('Too Many Requests', { code: 229 }, 429);
  }
};
