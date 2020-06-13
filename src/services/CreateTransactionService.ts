import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw Error('Invalid transaction type ');
    }

    const transactions_repository = getCustomRepository(TransactionsRepository);
    const categories_repository = getRepository(Category);

    const { total } = await transactions_repository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        "You don't have enough money to this transaction!",
        400,
      );
    }

    let category_id;
    const exists_category = await categories_repository.findOne({
      where: { title: category.trim() },
    });

    if (!exists_category) {
      const new_category = categories_repository.create({
        title: category.trim(),
      });
      await categories_repository.save(new_category);
      category_id = new_category.id;
    } else {
      category_id = exists_category.id;
    }

    const transaction = transactions_repository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactions_repository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
