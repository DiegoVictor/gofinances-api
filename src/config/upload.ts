import crypto from 'crypto';
import path from 'path';
import multer from 'multer';

const uploads_directory = path.resolve(__dirname, '..', '..', 'uploads');

export default {
  uploads_directory,
  storage: multer.diskStorage({
    destination: uploads_directory,
    filename(_, file, callback) {
      const hash = crypto.randomBytes(10).toString('hex');
      const name = `${hash}-${file.originalname}`;

      return callback(null, name);
    },
  }),
};
