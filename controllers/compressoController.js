import sharp from 'sharp';
import archiver from 'archiver';

export const compressImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed_images.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of req.files) {
      const inputBuffer = file.buffer;
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');

      // Create a fresh sharp instance for each step
      const metadata = await sharp(inputBuffer).metadata();

      let sharpPipeline = sharp(inputBuffer).rotate();

      // Optional resize
      if (metadata.width > 1920) {
        sharpPipeline = sharpPipeline.resize({ width: 1920, withoutEnlargement: true });
      }

      let compressedBuffer;
      let outputName;

      switch (file.mimetype) {
        case 'image/jpeg':
        case 'image/jpg':
          compressedBuffer = await sharpPipeline
            .jpeg({ quality: 85, mozjpeg: true, chromaSubsampling: '4:4:4' })
            .toBuffer();
          outputName = `${originalName}-compressed.jpg`;
          break;

        case 'image/png':
          compressedBuffer = await sharpPipeline
            .png({ compressionLevel: 9, palette: true })
            .toBuffer();
          outputName = `${originalName}-compressed.png`;
          break;

        case 'image/webp':
          compressedBuffer = await sharpPipeline
            .webp({ quality: 80, effort: 6 })
            .toBuffer();
          outputName = `${originalName}-compressed.webp`;
          break;

        case 'image/avif':
          compressedBuffer = await sharpPipeline
            .avif({ quality: 60, effort: 6 })
            .toBuffer();
          outputName = `${originalName}-compressed.avif`;
          break;

        default:
          compressedBuffer = await sharpPipeline
            .webp({ quality: 80 })
            .toBuffer();
          outputName = `${originalName}-compressed.webp`;
          break;
      }

      if (compressedBuffer && compressedBuffer.length > 0) {
        archive.append(compressedBuffer, { name: outputName });
      } else {
        console.warn(`Skipping file due to empty buffer: ${originalName}`);
      }
    }

    await archive.finalize(); // critical to close stream properly
  } catch (err) {
    console.error('Compression Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to compress images.' });
    }
  }
};
