/* eslint-disable no-unused-expressions */
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategorysRepository from '../repositories/CategorysRepository';
import upload from '../config/upload';

interface ResponseDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const data = await upload.loadCsv(filename);

    const transactions = data.map(transaction => ({
      title: transaction[0],
      type: transaction[1],
      value: transaction[2],
      category: transaction[3],
    }));

    const savedTransactions = transactions.map(t =>
      this.save(t.title, t.type, t.value, t.category),
    );

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const result = Promise.all(savedTransactions).then(trans =>
      transactionsRepository.find({
        where: {
          trans,
        },
      }),
    );

    return result;
  }

  public async save(
    title: string,
    type: 'income' | 'outcome',
    value: number,
    category: string,
  ): Promise<Transaction> {
    const categorysRepository = getCustomRepository(CategorysRepository);
    const categoryFinded = await categorysRepository.findByTitle(category).then(
      x =>
        x ||
        categorysRepository.save(
          categorysRepository.create({
            title: category,
          }),
        ),
    );

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryFinded.id,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default ImportTransactionsService;
