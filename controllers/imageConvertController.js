import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import heicConvert from "heic-convert";

const OUTPUT_DIR = path.join("output");

if (!existsSync(OUTPUT_DIR)) {
  fs.mkdir(OUTPUT_DIR, { recursive: true }).catch(console.error);
}

// Supported formats for output
const supportedFormats = [
  "jpeg", "jpg", "png", "webp", "avif", "tiff", "gif", "heif", "heic"
];


export const convertImage = async (req, res) => {
  try {
    const files = req.files;
    const { format = "png" } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: `Unsupported format "${format}".` });
    }

    const convertedImages = await Promise.all(
      files.map(async (file) => {
        try {
          const inputName = path.parse(file.originalname).name.replace(/[^a-z0-9-_]/gi, "_");
          const filename = `${inputName}-${uuidv4()}.${format}`;
          const outputPath = path.join(OUTPUT_DIR, filename);

          // Detect HEIC/HEIF input
          const isHEIC =
            file.mimetype.includes("heic") ||
            file.mimetype.includes("heif") ||
            file.originalname.toLowerCase().endsWith(".heic") ||
            file.originalname.toLowerCase().endsWith(".heif");

          // Convert to HEIC/HEIF output (experimental, rarely supported)
          if (["heic", "heif"].includes(format)) {
            // Check if sharp supports .toFormat(format, { compression: ... })
            try {
              let image = sharp(file.buffer).rotate();
              // Try HEVC compression (most common)
              await image.toFormat(format, { quality: 90, compression: "hevc" }).toFile(outputPath);
              return {
                originalName: file.originalname,
                convertedName: filename,
                path: outputPath,
                downloadUrl: `/output/${filename}`,
              };
            } catch (err) {
              return {
                originalName: file.originalname,
                error: "HEIC/HEIF output is not supported on this server. Please choose another format.",
              };
            }
          }

          // Convert from HEIC/HEIF input to other formats
          if (isHEIC) {
            if (!["jpg", "jpeg", "png", "webp", "avif", "tiff", "gif"].includes(format)) {
              return {
                originalName: file.originalname,
                error: "HEIC/HEIF images can only be converted to JPG, PNG, WEBP, AVIF, TIFF, or GIF.",
              };
            }
            const heicFormat = ["png", "webp"].includes(format) ? "PNG" : "JPEG";
            const intermediateBuffer = await heicConvert({
              buffer: file.buffer,
              format: heicFormat,
              quality: 1,
            });
            let image = sharp(intermediateBuffer).rotate();
            if (format === "jpeg" || format === "jpg") {
              await image.jpeg({ quality: 75 }).toFile(outputPath);
            } else if (format === "png") {
              await image.png({ compressionLevel: 9 }).toFile(outputPath);
            } else if (format === "webp") {
              await image.webp({ quality: 75 }).toFile(outputPath);
            } else if (format === "avif") {
              await image.avif({ quality: 50 }).toFile(outputPath);
            } else if (format === "tiff") {
              await image.tiff({ quality: 90 }).toFile(outputPath);
            } else if (format === "gif") {
              await image.gif().toFile(outputPath);
            }
            return {
              originalName: file.originalname,
              convertedName: filename,
              path: outputPath,
              downloadUrl: `/output/${filename}`,
            };
          }

          // Standard image conversion
          let image = sharp(file.buffer).rotate();
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