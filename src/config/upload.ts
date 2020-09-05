import crypto from 'crypto';
import path from 'path';
import multer from 'multer';

const uploadsDirectory = path.resolve(__dirname, '..', '..', 'uploads');

export default {
  uploads_directory: uploadsDirectory,
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename(_, file, callback) {
      const hash = crypto.randomBytes(10).toString('hex');
      const name = `${hash}-${file.originalname}`;

      return callback(null, name);
    },
  }),
};
