import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategorysRepository from '../repositories/CategorysRepository';
import upload from '../config/upload';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const data = await upload.loadCsv(filename);

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    data.map(t => {
      console.log(t);
      console.log(t.title);
      console.log(t.value);
      console.log(t.type);
      console.log(t.category);
    });

    // data.map(t => this.save(t));

    // return data;

    // const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.find();

    return transactions;
  }

  public async save({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // console.log(title);
    // console.log(value);
    // console.log(type);
    // console.log(category);

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
