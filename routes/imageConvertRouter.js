import express from "express";
import multer from "multer";
import { convertImage } from "../controllers/imageConvertController.js";
import { uploadImages } from '../middlewares/upload.js';

const router = express.Router();

router.post('/convert', uploadImages.array('images', 10), convertImage);
router.post('/', uploadImages.array('images', 10), convertImage);


export default router;