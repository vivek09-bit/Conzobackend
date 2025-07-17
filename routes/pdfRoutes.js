import express from 'express';
import multer from 'multer';
import { generatePdfFromImages } from '../controllers/pdfController.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/', upload.array('images', 10), generatePdfFromImages);

router.post('/pdf-to-jpg', pdfController.convertPdfToJpg);
export default router;
