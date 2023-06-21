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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

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

    categoryId = existsCategory?.id;
    if (!existsCategory) {
      const newCategory = categoriesRepository.create({
        title: category.trim(),
      });

      await categoriesRepository.save(newCategory);
      categoryId = newCategory.id;
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
