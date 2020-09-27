import { getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Balance from '../models/Balance';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface ResponseDTO {
  transactions: Transaction[];
  balance: Balance;
}

class ListTransactionService {
  public async execute(): Promise<ResponseDTO> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const response = {
      transactions: await transactionsRepository.find(),
      balance: await transactionsRepository.getBalance(),
    };

    return response;
  }
}

export default ListTransactionService;
