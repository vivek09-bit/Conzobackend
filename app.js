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
app.use('/api/jpg-to-pdf', pdfRoutes);
app.use('/api/compressor/image', compressoRoutes);

app.use("/api/image", imageConvertRouter);
app.use("/output", express.static(path.join("output")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
