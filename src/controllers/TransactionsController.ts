import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';

export default class TransactionsController {
  async index(_: Request, response: Response): Promise<Response> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository.find();

    const count = await transactionsRepository.count();
    response.header('X-Total-Count', count.toString());

    const balance = await transactionsRepository.getBalance();

    return response.json({ transactions, balance });
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { title, value, type, category } = request.body;

    const createTransaction = new CreateTransactionService();
    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category,
    });

    return response.status(201).json(transaction);
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const deleteTransaction = new DeleteTransactionService();
    await deleteTransaction.execute({ id });

    return response.sendStatus(204);
  }
}
