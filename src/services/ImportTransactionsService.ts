import fs from 'fs';
import csv from 'csv-parse';
import path from 'path';

import { getCustomRepository, getRepository } from 'typeorm';

import uploadConfiguration from '../config/upload';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

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
    const filePath = path.resolve(
      uploadConfiguration.uploads_directory,
      transactions_filename,
    );

    const parsedTransactions: TransactionProps[] = [];
    const categories: string[] = [];

    const categoriesRepository = getRepository(Category);
    const existingCategories = await categoriesRepository.find();
    const categoriesTitles = existingCategories.map(({ title }) =>
      title.trim(),
    );

    await new Promise<TransactionProps[]>(resolve => {
      fs.createReadStream(filePath)
        .pipe(csv({ trim: true, from_line: 2 }))
        .on('data', ([title, type, value, category]) => {
          parsedTransactions.push({
            title,
            type,
            value: Number(value),
            category: category.trim(),
          });

          if (
            !categoriesTitles.includes(category) &&
            !categories.includes(category)
          ) {
            categories.push(category);
          }
        })
        .on('end', resolve);
    });

    const savedCategories = categoriesRepository.create(
      categories.map(title => ({ title })),
    );
    await categoriesRepository.save(savedCategories);

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.create(
      parsedTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: [...savedCategories, ...existingCategories].find(
          ({ title }) => title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
