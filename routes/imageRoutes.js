import express from 'express';
import { uploadImages, uploadPdf  } from '../middlewares/upload.js';
import { convertPdfToImages } from '../controllers/imageController.js';

const router = express.Router();

// POST /api/pdftoimage

router.post('/imagetopdf', uploadImages.array('images'), controller.convertImagesToPdf);

router.post('/pdftoimage', uploadPdf.single('pdf'), controller.convertPdfToImages);

export default router;
