/* eslint-disable no-useless-concat */
import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import ListTransactionService from '../services/ListTransactionService';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const listTransactionService = new ListTransactionService();
  const transaction = await listTransactionService.execute();

  return response.json(transaction);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('transactions'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const csvData = await importTransactionsService.import(
      request.file.filename,
    );

    const transactions = await importTransactionsService.save(csvData);

    return response.json(transactions);
  },
);

export default transactionsRouter;
