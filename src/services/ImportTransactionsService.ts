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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    let newTransactions;

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const nonExistentCategories = categories.filter(
      category => !existentCategoriesTitles.includes(category),
    );

    if (nonExistentCategories.length > 0) {
      const newCategories = await categoriesRepository.save(
        categoriesRepository.create(
          nonExistentCategories.map(categoryName => ({
            title: categoryName,
          })),
        ),
      );

      newTransactions = transactionsRepository.save(
        transactionsRepository.create(
          transactions.map(transaction => ({
            title: transaction.title,
            type: transaction.type,
            category: newCategories.find(
              category => category.title === transaction.category,
            ),
            category_id: newCategories.find(
              category => category.title === transaction.category,
            )?.id,
            value: transaction.value,
          })),
        ),
      );
    } else {
      newTransactions = transactionsRepository.save(
        transactionsRepository.create(
          transactions.map(transaction => ({
            title: transaction.title,
            type: transaction.type,
            category: existentCategories.find(
              category => category.title === transaction.category,
            ),
            category_id: existentCategories.find(
              category => category.title === transaction.category,
            )?.id,
            value: transaction.value,
          })),
        ),
      );
    }
    return newTransactions;
  }
}

export default ImportTransactionsService;
