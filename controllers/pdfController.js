import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export const generatePdfFromImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    // Convert all images to PNG buffers using sharp
    const pngBuffers = await Promise.all(
      req.files.map(async (file) => {
        return sharp(file.buffer)
          .rotate() // Auto-rotate based on EXIF data
          .png()
          .toBuffer();
      })
    );

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    for (const pngBuffer of pngBuffers) {
      // Embed the image in the PDF
      const img = await pdfDoc.embedPng(pngBuffer);
      const { width: imgWidth, height: imgHeight } = img.size();

      // Create a new page with default dimensions
      const page = pdfDoc.addPage();

      // Get the page dimensions
      const { width: pageWidth, height: pageHeight } = page.getSize();

      // Calculate the scale to fit the image within the page while maintaining aspect ratio
      const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

      // Calculate the centered position
      const x = (pageWidth - imgWidth * scale) / 2;
      const y = (pageHeight - imgHeight * scale) / 2;

      // Draw the image on the page
      page.drawImage(img, {
        x,
        y,
        width: imgWidth * scale,
        height: imgHeight * scale,
      });
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=converted.pdf',
      'Content-Length': pdfBytes.length,
    });
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
};

export const convertPdfToJpg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const pdfBuffer = req.file.buffer;
    const { pages } = await sharp(pdfBuffer).pdf().pages();
    const images = [];
    for (let i = 0; i < pages; i++) {
      const img = await sharp(pdfBuffer)
        .pdf({ page: i })
        .jpeg({ quality: 90 })
        .toBuffer();
      images.push(img);
    }
    res.set('Content-Type', 'image/jpeg');
    res.status(200).send(Buffer.concat(images));
  } catch (error) {
    console.error('Error converting PDF to JPG:', error);
    res.status(500).json({ error: 'Failed to convert PDF to JPG' });
  }
};
