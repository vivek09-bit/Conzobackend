import sharp from "sharp";
import { PDFDocument, rgb } from "pdf-lib";

// Convert images to consistent format and embed into PDF
export const createPdfWithImages = async (files) => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    // Normalize and resize if necessary
    const imageBuffer = await sharp(file.buffer)
      .resize({ width: 600, withoutEnlargement: true })
      .toFormat("jpeg")
      .toBuffer();

    const image = await pdfDoc.embedJpg(imageBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdfDoc.save();
};
