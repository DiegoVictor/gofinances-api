import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import upload_configuration from '../config/upload';

const transactionsRouter = Router();
const upload = multer(upload_configuration);

transactionsRouter.get('/', async (_, response) => {
  const transactions_repository = getCustomRepository(TransactionsRepository);

  const transactions = await transactions_repository.find();
  const balance = await transactions_repository.getBalance();

  return response.json({ transactions, balance });
});

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

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const import_transactions = new ImportTransactionsService();
    const transactions = await import_transactions.execute({
      transactions_filename: request.file.filename,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;