import { getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Balance from '../models/Balance';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface CompleteTransaction {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: Category;
  created_at: Date;
  updated_at: Date;
}

interface ResponseDTO {
  transactions: CompleteTransaction[];
  balance: Balance;
}

class ListTransactionService {
  public async execute(): Promise<ResponseDTO> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository.find();

    const completeTransactions = transactions.map(t => {
      const category = categoriesRepository.findOne({
        where: { id: t.id },
      });

      const trans = {
        id: t.id,
        title: t.title,
        type: t.type,
        value: t.value,
        category: { category },
        created_at: t.created_at,
        updated_at: t.updated_at,
      };

      return trans;
    });

    const response = {
      transactions: await completeTransactions,
      balance: await transactionsRepository.getBalance(),
    };

    return response;
  }
}

export default ListTransactionService;
