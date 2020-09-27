import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import upload from '../config/upload';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    console.log(upload.directory);

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionsRepository.find();

    return transactions;
  }
}

export default ImportTransactionsService;
