import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import csvParse from 'csv-parse';
import fs from 'fs';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

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

export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;
      return callback(null, fileName);
    },
  }),
  loadCsv: async (fileName: string): Promise<CsvDTO> => {
    const csvFilePath = path.resolve(tmpFolder, fileName);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const transactions: TransactionDTO[] = [];

    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    await fs.promises.unlink(csvFilePath);

    return {
      transactions,
      categories,
    };
  },
};
