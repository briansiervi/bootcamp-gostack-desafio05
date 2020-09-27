import { Router } from 'express';

// import TransactionsRepository from '../repositories/TransactionsRepository';
import ListTransactionService from '../services/ListTransactionService';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

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
  // TODO
  return response.json({ verb: 'delete' });
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
  return response.json({ verb: 'post' });
});

export default transactionsRouter;
