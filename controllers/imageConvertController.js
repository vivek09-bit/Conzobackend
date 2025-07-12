import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises"; // Async fs
import { existsSync } from "fs";

const OUTPUT_DIR = path.join("output");

// Ensure output directory exists only once
if (!existsSync(OUTPUT_DIR)) {
  fs.mkdir(OUTPUT_DIR, { recursive: true }).catch(console.error);
}

const supportedFormats = ["jpeg", "jpg", "png", "webp", "avif", "tiff", "gif"];

export const convertImage = async (req, res) => {
  try {
    const files = req.files;
    const { format = "png" } = req.body;
    console.log(format)

    // Validate inputs
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: `Unsupported format "${format}".` });
    }

    // Convert images in parallel using Promise.all
    const convertedImages = await Promise.all(
      files.map(async (file) => {
        try {
          const inputName = path.parse(file.originalname).name.replace(/[^a-z0-9-_]/gi, "_");
          const filename = `${inputName}-${uuidv4()}.${format}`;
          const outputPath = path.join(OUTPUT_DIR, filename);

          // Start Sharp processing
          let image = sharp(file.buffer).rotate(); // Auto-orient based on EXIF

          // Format-specific output
          const formatOptions = {
            jpeg: () => image.jpeg({ quality: 90 }),
            jpg: () => image.jpeg({ quality: 90 }),
            png: () => image.png({ compressionLevel: 6 }),
            webp: () => image.webp({ quality: 90 }),
            avif: () => image.avif({ quality: 80 }),
            tiff: () => image.tiff({ quality: 90 }),
            gif: () => image.gif(),
          };

          await formatOptions[format]?.().toFile(outputPath);

          return {
            originalName: file.originalname,
            convertedName: filename,
            path: outputPath,
            downloadUrl: `/output/${filename}`,
          };
        } catch (fileErr) {
          console.error(`Error converting file ${file.originalname}:`, fileErr);
          return { originalName: file.originalname, error: "Failed to convert this image." };
        }
      })
    );

    const successCount = convertedImages.filter(img => !img.error).length;

    return res.status(200).json({
      message: `${successCount} image(s) converted to .${format} successfully.`,
      images: convertedImages,
    });
  } catch (err) {
    console.error("Conversion error:", err);
    return res.status(500).json({ error: "Server error during image conversion." });
  }
};
