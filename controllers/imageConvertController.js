  import sharp from "sharp";
  import { v4 as uuidv4 } from "uuid";
  import path from "path";
  import fs from "fs";

  export const convertImage = async (req, res) => {
    try {
      const files = req.files; // Handles array of files, even if it's just one

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images uploaded." });
      }

      const { format = "png" } = req.body;
      const supportedFormats = ["jpeg", "jpg", "png", "webp", "avif", "tiff"];

      if (!supportedFormats.includes(format)) {
        return res.status(400).json({ error: "Unsupported format requested." });
      }

      const outputDir = path.join("output");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const convertedImages = [];

      for (const file of files) {
        const filename = `${uuidv4()}.${format}`;
        const outputPath = path.join(outputDir, filename);

        let image = sharp(file.buffer).rotate();

        switch (format) {
          case "jpeg":
          case "jpg":
            image = image.jpeg({ quality: 90 });
            break;
          case "png":
            image = image.png({ compressionLevel: 6 });
            break;
          case "webp":
            image = image.webp({ quality: 90 });
            break;
          case "avif":
            image = image.avif({ quality: 80 });
            break;
          case "tiff":
            image = image.tiff({ quality: 90 });
            break;
        }

        await image.toFile(outputPath);

        convertedImages.push({
          originalName: file.originalname,
          convertedName: filename,
          path: outputPath,
          downloadUrl: `/output/${filename}`, // Optional: for frontend
        });
      }

      // Return array of converted image data
      return res.status(200).json({
        message: `${convertedImages.length} image(s) converted successfully.`,
        images: convertedImages,
      });
    } catch (err) {
      console.error("Conversion error:", err);
      res.status(500).json({ error: "Failed to convert images." });
    }
  };
