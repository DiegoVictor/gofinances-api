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
      throw new AppError('Invalid transaction type');
    }

    const transactions_repository = getCustomRepository(TransactionsRepository);
    const categories_repository = getRepository(Category);

    const { total } = await transactions_repository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        "You don't have enough money to this transaction!",
        { code: 141 },
        401,
      );
    }

    let categoryId;
    const existsCategory = await categoriesRepository.findOne({
      where: { title: category.trim() },
    });

    if (!existsCategory) {
      const newCategory = categoriesRepository.create({
        title: category.trim(),
      });
      await categoriesRepository.save(newCategory);
      categoryId = newCategory.id;
    } else {
      categoryId = existsCategory.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
