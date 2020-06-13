import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactions_repository = getCustomRepository(TransactionsRepository);

    const transaction = await transactions_repository.findOne(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    await transactions_repository.delete(id);
  }
}

export default DeleteTransactionService;
