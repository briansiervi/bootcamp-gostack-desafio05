import { getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategorysRepository from '../repositories/CategorysRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
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
  }: RequestDTO): Promise<Transaction> {
    const categorysRepository = getCustomRepository(CategorysRepository);

    const newCategory = categorysRepository.create({
      title: category,
    });

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: newCategory.id,
    });

    await categorysRepository.save(newCategory);
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
