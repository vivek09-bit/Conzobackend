import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import heicConvert from "heic-convert";
import archiver from "archiver";

export const convertImage = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    const format = (req.body.format || req.params?.toFormat || "jpg").toLowerCase();
    const supportedFormats = ["jpeg", "jpg", "png", "webp", "avif", "tiff"];

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: "Unsupported format requested." });
    }

    const convertedImages = [];

    for (const file of files) {
      const fileExt = format === "jpg" ? "jpg" : format;
      const filename = `${uuidv4()}.${fileExt}`;

      let outputBuffer;

      // Detect HEIC/HEIF
      const isHEIC =
        file.mimetype.includes("heic") ||
        file.mimetype.includes("heif") ||
        file.originalname.toLowerCase().endsWith(".heic") ||
        file.originalname.toLowerCase().endsWith(".heif");

      if (isHEIC) {
        if (!["jpg", "jpeg", "png"].includes(format)) {
          return res.status(400).json({
            error: "HEIC/HEIF images can only be converted to JPG or PNG.",
          });
        }

        const heicFormat = format === "png" ? "PNG" : "JPEG";

        outputBuffer = await heicConvert({
          buffer: file.buffer,
          format: heicFormat,
          quality: 1,
        });
      } else {
        // Sharp for standard images
        let image = sharp(file.buffer).rotate();

        if (format === "jpeg" || format === "jpg") {
          image = image.jpeg({ quality: 90 });
        } else if (format === "png") {
          image = image.png({ compressionLevel: 6 });
        } else if (format === "webp") {
          image = image.webp({ quality: 90 });
        } else if (format === "avif") {
          image = image.avif({ quality: 80 });
        } else if (format === "tiff") {
          image = image.tiff({ quality: 90 });
        }

        outputBuffer = await image.toBuffer();
      }

      const mimeTypeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        avif: "image/avif",
        tiff: "image/tiff",
      };

      convertedImages.push({
        filename,
        type: mimeTypeMap[fileExt],
        data: outputBuffer.toString("base64"),
      });
    }

    res.status(200).json({ images: convertedImages });

  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: "Failed to convert images." });
  }
};

