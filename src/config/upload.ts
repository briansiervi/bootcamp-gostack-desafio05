import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import csvParse from 'csv-parse';
import fs from 'fs';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

interface ResponseFileDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
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

  loadCsv: async (fileName: string): Promise<ResponseFileDTO[]> => {
    const csvFilePath = path.resolve(tmpFolder, fileName);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: ResponseFileDTO[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  },
};
