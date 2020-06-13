import { Router } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';
const transactionsRouter = Router();
transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const create_transaction = new CreateTransactionService();
  const transaction = await create_transaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});


export default transactionsRouter;
