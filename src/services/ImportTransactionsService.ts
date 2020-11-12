// /* eslint-disable no-unused-expressions */
import { getCustomRepository, getRepository, In } from 'typeorm';
import upload from '../config/upload';
import Category from '../models/Category';
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
    const categoriesRepository = getRepository(Category);
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

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(categoryName => ({
        title: categoryName,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
