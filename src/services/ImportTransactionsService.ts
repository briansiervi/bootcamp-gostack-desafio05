// /* eslint-disable no-unused-expressions */
import { getCustomRepository, In } from 'typeorm';
import upload from '../config/upload';
import Category from '../models/Category';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CsvDTO {
  transactions: TransactionDTO[];
  categories: string[];
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface ResponseDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: Category;
}

class ImportTransactionsService {
  async import(filename: string): Promise<CsvDTO> {
    const csvData = await upload.loadCsv(filename);

    const distinctCsvDataCategories = csvData.categories.filter(
      (value, index, self) => self.indexOf(value) === index,
    );

    return {
      transactions: csvData.transactions,
      categories: distinctCsvDataCategories,
    };
  }

  public async save({
    transactions,
    categories,
  }: CsvDTO): Promise<ResponseDTO[]> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const categoriesFinded = await categoriesRepository
      .find({
        where: {
          title: In(categories),
        },
      })
      .then(
        x =>
          x ||
          categories.map(categoryName =>
            categoriesRepository.save(
              categoriesRepository.create({
                title: categoryName,
              }),
            ),
          ),
      );

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const newTransactions = transactionsRepository.save(
      transactionsRepository.create(
        transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          category: categoriesFinded.find(
            category => category.title === transaction.category,
          ),
          category_id: categoriesFinded.find(
            category => category.title === transaction.category,
          )?.id,
          value: transaction.value,
        })),
      ),
    );

    return newTransactions;
  }
}

export default ImportTransactionsService;
