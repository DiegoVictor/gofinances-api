import { Request, Response } from 'express';

import ImportTransactionsService from '../services/ImportTransactionsService';

interface CustomRequest {
  file: {
    filename: string;
  };
}

export default class UploadTransactionsController {
  async store(
    request: Request & CustomRequest,
    response: Response,
  ): Promise<Response> {
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute({
      transactions_filename: request.file.filename,
    });

    return response.json(transactions);
  }
}
