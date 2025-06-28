import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import heicConvert from "heic-convert";

export const convertImage = async (req, res) => {
  try {
    const file = req.files?.[0];

    if (!file || !file.buffer) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    const { format = "jpg" } = req.body;
    const supportedFormats = ["jpeg", "jpg", "png", "webp", "avif", "tiff"];

    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: "Unsupported format." });
    }

    const outputDir = path.join("output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `${uuidv4()}.${format}`;
    const outputPath = path.join(outputDir, filename);

    let outputBuffer;

    // Use heic-convert if input is HEIC
    if (
      file.mimetype === "image/heic" ||
      file.originalname.toLowerCase().endsWith(".heic")
    ) {
      if (!["jpg", "jpeg", "png"].includes(format.toLowerCase())) {
        return res.status(400).json({
          error: "HEIC images can only be converted to JPG or PNG.",
        });
      }

      const heicFormat = format.toLowerCase() === "png" ? "PNG" : "JPEG";

      outputBuffer = await heicConvert({
        buffer: file.buffer,
        format: heicFormat,
        quality: 1,
      });
    }
    else {
      // Use sharp for other formats
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

    fs.writeFileSync(outputPath, outputBuffer);

    res.setHeader("Content-Type", `image/${format}`);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    fs.createReadStream(outputPath).pipe(res);
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: "Failed to convert image." });
  }
};
