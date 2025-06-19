import express from 'express';
import { uploadImages } from '../middlewares/upload.js';
import { compressImages } from '../controllers/compressoController.js';

const router = express.Router();

router.post('/image', uploadImages.array('images', 10), compressImages);

export default router;
