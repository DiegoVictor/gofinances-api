import request from 'supertest';
import path from 'path';
import { Connection, getRepository, getConnection } from 'typeorm';

import app from '../../src/app';
import createConnection from '../../src/database/typeorm';
import Transaction from '../../src/models/Transaction';
import Category from '../../src/models/Category';
import factory from '../utils/factory';

interface TransactionItem {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

describe('Transaction', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection('test-connection');

    await connection.query('DROP TABLE IF EXISTS transactions');
    await connection.query('DROP TABLE IF EXISTS categories');
    await connection.query('DROP TABLE IF EXISTS migrations');

    await connection.runMigrations();
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM transactions');
    await connection.query('DELETE FROM categories');
  });

  afterAll(async () => {
    const mainConnection = getConnection();

    await connection.close();
    await mainConnection.close();
  });

  it('should be able to list transactions', async () => {
    const transactions = await factory.attrsMany<TransactionItem>(
      'Transaction',
      3,
      [
        { type: 'income', value: 4000 },
        { type: 'income', value: 4000 },
        { type: 'outcome', value: 6000 },
      ],
    );

    async function saveTransaction(array: TransactionItem[]): Promise<void> {
      const item = array.shift();
      await request(app).post('/v1/transactions').send(item);

      if (array.length > 0) {
        await saveTransaction(array);
      }
    }
    await saveTransaction(transactions);

    const response = await request(app).get('/v1/transactions');

    expect(response.body.transactions).toHaveLength(3);
    expect(response.body.balance).toMatchObject({
      income: 8000,
      outcome: 6000,
      total: 2000,
    });
  });

  it('should be able to create new transaction', async () => {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    const {
      title,
      type,
      value,
      category: categoryTitle,
    } = await factory.attrs<TransactionItem>('Transaction', { type: 'income' });

    const response = await request(app)
      .post('/v1/transactions')
      .send({ title, type, value, category: categoryTitle });

    const transaction = await transactionsRepository.findOne({
      where: { title },
    });

    expect(transaction).toBeTruthy();

    const category = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });

    expect(category).toBeTruthy();

    expect(response.body).toMatchObject({
      id: transaction?.id,
      category_id: category?.id,
      title,
      type,
      value,
    });
  });

  it('should create tags when inserting new transactions', async () => {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    const {
      title,
      type,
      value,
      category: categoryTitle,
    } = await factory.attrs<TransactionItem>('Transaction', { type: 'income' });

    const response = await request(app).post('/v1/transactions').send({
      title,
      type,
      value,
      category: categoryTitle,
    });

    const category = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });

    expect(category).toBeTruthy();

    const transaction = await transactionsRepository.findOne({
      where: {
        title,
        category_id: category?.id,
      },
    });

    expect(transaction).toBeTruthy();

    expect(response.body).toMatchObject({
      id: transaction?.id,
      category_id: category?.id,
      title,
      type,
      value,
    });
  });

  it('should not create tags when they already exists', async () => {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    const { title, type, value, category } =
      await factory.attrs<TransactionItem>('Transaction', { type: 'income' });

    const { identifiers } = await categoriesRepository.insert({
      title: category,
    });

    const [{ id: category_id }] = identifiers;

    await request(app).post('/v1/transactions').send({
      title,
      type,
      value,
      category,
    });

    const transaction = await transactionsRepository.findOne({
      where: {
        title,
        category_id,
      },
    });
    expect(transaction).toBeTruthy();

    const categoriesCount = await categoriesRepository.find();

    expect(categoriesCount).toHaveLength(1);
  });

  it('should not be able to create outcome transaction without a valid balance', async () => {
    const [{ title, type, value, category }, transaction] =
      await factory.attrsMany<TransactionItem>('Transaction', 2, [
        { type: 'income' },
        { type: 'outcome' },
      ]);

    await request(app)
      .post('/v1/transactions')
      .send({ title, type, value, category });

    const response = await request(app)
      .post('/v1/transactions')
      .expect(401)
      .send({
        ...transaction,
        value: value + 500,
      });

    expect(response.body).toMatchObject({
      status: 'error',
      message: "You don't have enough money to this transaction!",
      code: 141,
      docs: process.env.DOCS_URL,
    });
  });

  it('should be able to delete a transaction', async () => {
    const transactionsRepository = getRepository(Transaction);
    const transaction = await factory.attrs<TransactionItem>('Transaction', {
      type: 'income',
    });

    const response = await request(app)
      .post('/v1/transactions')
      .send(transaction);

    await request(app).delete(`/v1/transactions/${response.body.id}`);

    const deletedTransaction = await transactionsRepository.findOne(
      response.body.id,
    );

    expect(deletedTransaction).toBeFalsy();
  });

  it('should not be able to delete a transaction that not exists', async () => {
    const transactionsRepository = getRepository(Transaction);
    const { title, type, value } = await factory.attrs<TransactionItem>(
      'Transaction',
      {
        type: 'income',
      },
    );

    const transaction = await transactionsRepository.create({
      title,
      type,
      value,
    });
    await transactionsRepository.save(transaction);
    await transactionsRepository.delete(transaction.id);

    const response = await request(app)
      .delete(`/v1/transactions/${transaction.id}`)
      .expect(404);

    expect(response.body).toStrictEqual({
      status: 'error',
      message: 'Transaction not found',
      code: 144,
      docs: process.env.DOCS_URL,
    });
  });

  it('should be able to import transactions', async () => {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const importCSV = path.resolve(
      __dirname,
      '..',
      'files',
      'import_template.csv',
    );

    await request(app)
      .post('/v1/transactions/import')
      .attach('file', importCSV);

    const transactions = await transactionsRepository.find();
    const categories = await categoriesRepository.find();

    expect(categories).toHaveLength(2);
    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Others',
        }),
        expect.objectContaining({
          title: 'Food',
        }),
      ]),
    );

    expect(transactions).toHaveLength(3);
    expect(transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Loan',
          type: 'income',
        }),
        expect.objectContaining({
          title: 'Website Hosting',
          type: 'outcome',
        }),
        expect.objectContaining({
          title: 'Ice cream',
          type: 'outcome',
        }),
      ]),
    );
  });

  it('should be able to import transactions', async () => {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const importCSV = path.resolve(
      __dirname,
      '..',
      'files',
      'import_template.csv',
    );

    const category = categoriesRepository.create({
      title: 'Food',
    });
    await categoriesRepository.save(category);

    await request(app)
      .post('/v1/transactions/import')
      .attach('file', importCSV);

    const transactions = await transactionsRepository.find();
    const categories = await categoriesRepository.find();

    expect(categories).toHaveLength(2);
    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Others',
        }),
        expect.objectContaining({
          title: 'Food',
        }),
      ]),
    );

    expect(transactions).toHaveLength(3);
    expect(transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Loan',
          type: 'income',
        }),
        expect.objectContaining({
          title: 'Website Hosting',
          type: 'outcome',
        }),
        expect.objectContaining({
          title: 'Ice cream',
          type: 'outcome',
        }),
      ]),
    );
  });

  it('should not be able to import transactions without send file', async () => {
    const response = await request(app)
      .post('/v1/transactions/import')
      .expect(400)
      .send();

    expect(response.body).toStrictEqual({
      status: 'error',
      message: 'Missing file',
      code: 140,
      docs: process.env.DOCS_URL,
    });
  });
});
