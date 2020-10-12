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

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = await categoriesRepository.save(
      categoriesRepository.create(
        addCategoryTitles.map(categoryName => ({
          title: categoryName,
        })),
      ),
    );

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = await transactionsRepository.save(
      transactionsRepository.create(
        transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: finalCategories.find(
            category => category.title === transaction.category,
          ),
          category_id: finalCategories.find(
            category => category.title === transaction.category,
          )?.id,
        })),
      ),
    );

    return createdTransactions;
  }
}

export default ImportTransactionsService;
