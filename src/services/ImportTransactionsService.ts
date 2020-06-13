import fs from 'fs';
import csv from 'csv-parse';
import path from 'path';

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import upload_configuration from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  transactions_filename: string;
}

interface TransactionProps {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ transactions_filename }: Request): Promise<Transaction[]> {
    const file_path = path.resolve(
      upload_configuration.uploads_directory,
      transactions_filename,
    );

    const transactions_file_exists = await fs.promises.stat(file_path);
    if (!transactions_file_exists) {
      throw new AppError('Oops! Something goes wrong during the upload!', 500);
    }

    const parsed_transactions: TransactionProps[] = [];
    const categories: string[] = [];

    const categories_repository = getRepository(Category);
    const existing_categories = await categories_repository.find();
    const categories_titles = existing_categories.map(({ title }) =>
      title.trim(),
    );

    await new Promise<TransactionProps[]>(resolve => {
      fs.createReadStream(file_path)
        .pipe(csv({ trim: true, from_line: 2 }))
        .on('data', ([title, type, value, category]) => {
          parsed_transactions.push({
            title,
            type,
            value: Number(value),
            category: category.trim(),
          });

          if (
            !categories_titles.includes(category) &&
            !categories.includes(category)
          ) {
            categories.push(category);
          }
        })
        .on('end', resolve);
    });

    const saved_categories = categories_repository.create(
      categories.map(title => ({ title })),
    );
    await categories_repository.save(saved_categories);

    const transactions_repository = getCustomRepository(TransactionsRepository);
    const transactions = transactions_repository.create(
      parsed_transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: [...saved_categories, ...existing_categories].find(
          ({ title }) => title === transaction.category,
        ),
      })),
    );

    await transactions_repository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
