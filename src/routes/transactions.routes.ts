import { Router } from 'express';
import multer from 'multer';

import uploadConfiguration from '../config/upload';
import TransactionsController from '../controllers/TransactionsController';
import UploadTransactionsController from '../controllers/UploadTransactionsController';
import idValidator from '../validators/idValidator';
import transactionValidator from '../validators/transactionValidator';

const transactionsRouter = Router();
const upload = multer(uploadConfiguration);

const transactionsContoller = new TransactionsController();
const uploadTransactionsController = new UploadTransactionsController();

transactionsRouter.get('/', transactionsContoller.index);
transactionsRouter.post('/', transactionValidator, transactionsContoller.store);
transactionsRouter.delete('/:id', idValidator, transactionsContoller.delete);

transactionsRouter.post(
  '/import',
  upload.single('file'),
  uploadTransactionsController.store,
);

export default transactionsRouter;
