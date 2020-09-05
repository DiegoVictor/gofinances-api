import { Router } from 'express';

import transactionsRouter from './transactions.routes';
import RateLimit from '../middlewares/RateLimit';

const routes = Router();

routes.use(RateLimit);

routes.use('/transactions', transactionsRouter);

export default routes;
