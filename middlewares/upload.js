import multer from "multer";

// Common in-memory storage
const storage = multer.memoryStorage();

// File filters
const imageFileFilter = (req, file, cb) => {
  if (/image\/(png|jpeg|webp|jpg|tiff|avif)/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported image type. Only PNG and JPG are allowed."), false);
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
