import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { fromBuffer } = require('pdf-to-png-converter');

export const convertPdfToImages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const images = await fromBuffer(req.file.buffer, {
      outputType: 'buffer', // Return images as buffers
      quality: 100, // Image quality
    });

    const imageBuffers = images.map((image, index) => ({
      filename: `page-${index + 1}.png`,
      content: image.content.toString('base64'),
    }));

    res.json({ images: imageBuffers });
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    res.status(500).json({ error: 'Failed to convert PDF to images.' });
  }
};
