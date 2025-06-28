import multer from "multer";

// Common in-memory storage
const storage = multer.memoryStorage();

// File filters
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/jpg',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif',
    'application/octet-stream' // fallback for unknown types like HEIC
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported image type. Only PNG, JPG, WEBP, TIFF, AVIF, and HEIC are allowed."), false);
  }
};


const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Only PDF files are allowed."), false);
  }
};

// Uploaders with limits
export const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max per image
});

export const uploadPdf = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max for PDF
});
