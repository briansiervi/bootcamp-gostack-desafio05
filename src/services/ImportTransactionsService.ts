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
  async execute(filename: string): Promise<ResponseDTO[]> {
    const data = await upload.loadCsv(filename);
    const transactions: ResponseDTO[] = [];

    data.map(t => this.save(t[0], t[1], t[2], t[3]));

    data.map(transaction =>
      transactions.push({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category.title,
      }),
    );

    return transactions;

    // const transactionsRepository = getCustomRepository(TransactionsRepository);
    // const transactions = transactionsRepository.find();
    // return transactions;
  }

  public async save(
    title: string,
    value: number,
    type: 'income' | 'outcome',
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

  // public saveAll(transactions: RequestDTO[]): Transaction[] {
  //   const response = [] as Transaction[];

  //   transactions.map(t => {
  //     const categorysRepository = getCustomRepository(CategorysRepository);
  //     const categoryFinded = await categorysRepository
  //       .findByTitle(t.category)
  //       .then(
  //         x =>
  //           x ||
  //           categorysRepository.save(
  //             categorysRepository.create({
  //               title: t.category,
  //             }),
  //           ),
  //       );

  //     const transactionsRepository = getCustomRepository(
  //       TransactionsRepository,
  //     );
  //     const transaction = transactionsRepository.create({
  //       title: t.title,
  //       value: t.value,
  //       type: t.type,
  //       category_id: categoryFinded.id,
  //     });

  //     return transactionsRepository.save(transaction);
  //   });
  // }
}

export default ImportTransactionsService;
