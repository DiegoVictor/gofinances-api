import { Router } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
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

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const delete_transaction = new DeleteTransactionService();
  await delete_transaction.execute({ id });

  return response.sendStatus(204);
});

export default transactionsRouter;
