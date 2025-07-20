import express from 'express';
import cors from 'cors';
import path from 'path';

import pdfRoutes from './routes/pdfRoutes.js';
import compressoRoutes from './routes/compressoRoutes.js';
import imageConvertRouter from "./routes/imageConvertRouter.js";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/imagetopdf', pdfRoutes);
app.use('/api/compressor', compressoRoutes);
app.use("/api/image", imageConvertRouter);
app.use("/api/jpg-to-webp", imageConvertRouter);
app.use("/api/png-to-jpg", imageConvertRouter);
app.use("/api/jpg-to-png", imageConvertRouter);
app.use("/api/webp-to-jpg", imageConvertRouter);
app.use("/api/webp-to-png", imageConvertRouter);
app.use("/api/avif-to-jpg", imageConvertRouter); 
app.use("/api/jpeg-to-jpg", imageConvertRouter); 
app.use("/api/Jpg-to-jpeg", imageConvertRouter); 
app.use("/api/Jpg-to-gif", imageConvertRouter); 
app.use("/api/heic-to-png", imageConvertRouter); 
app.use("/api/heic-to-jpg", imageConvertRouter); 
app.use("/api/avif-to-png", imageConvertRouter); 


app.use('/api/jpg-to-pdf', pdfRoutes);
app.use('/api/pdf-to-jpg', pdfRoutes);

app.use("/output", express.static(path.join("output")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
