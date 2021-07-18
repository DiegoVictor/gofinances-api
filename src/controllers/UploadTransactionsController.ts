import { Request, Response } from 'express';
import AppError from '../errors/AppError';

import ImportTransactionsService from '../services/ImportTransactionsService';

interface CustomRequest {
  file?: {
    filename: string;
  };
}

export default class UploadTransactionsController {
  async store(
    request: Request & CustomRequest,
    response: Response,
  ): Promise<Response> {
    const importTransactions = new ImportTransactionsService();

    if (request.file) {
      const transactions = await importTransactions.execute({
        transactions_filename: request.file.filename,
      });

      return response.json(transactions);
    }

    throw new AppError('Missing file', { code: 140 });
  }
}
