export const convertImage = async (req, res) => {
  try {
    const files = req.files;
    const { format = "jpg" } = req.body;

    const supportedFormats = ["jpeg", "jpg", "png", "webp", "avif", "tiff"];
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ error: "Unsupported format." });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    const outputDir = path.join("output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const results = [];

    for (const file of files) {
      let outputBuffer;
      const fileName = `${uuidv4()}.${format}`;
      const outputPath = path.join(outputDir, fileName);

      if (
        file.mimetype === "image/heic" ||
        file.originalname.toLowerCase().endsWith(".heic")
      ) {
        if (!["jpg", "jpeg", "png"].includes(format.toLowerCase())) {
          continue; // skip unsupported HEIC conversion
        }

        const heicFormat = format.toLowerCase() === "png" ? "PNG" : "JPEG";
        outputBuffer = await heicConvert({
          buffer: file.buffer,
          format: heicFormat,
          quality: 1,
        });
      } else {
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

      // Write to disk temporarily
      fs.writeFileSync(outputPath, outputBuffer);

      // Read as base64
      const base64Image = fs.readFileSync(outputPath).toString("base64");

      results.push({
        name: fileName,
        type: `image/${format}`,
        data: base64Image,
      });

      // Optional: delete temp file after conversion
      fs.unlinkSync(outputPath);
    }

    return res.json({ images: results });
  } catch (err) {
    console.error("Conversion error:", err);
    return res.status(500).json({ error: "Failed to convert images." });
  }
};
