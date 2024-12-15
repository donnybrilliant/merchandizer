require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const sharp = require("sharp");

const multerUpload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

async function resizeImage(buffer, width = 300, height = 300) {
  const resizedBuffer = await sharp(buffer)
    .resize(width, height)
    .png()
    .toBuffer();
  return resizedBuffer;
}

// Create a new S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload an image to S3 bucket
async function uploadToS3(key, buffer, mimeType) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  // Create URL for image
  const location = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return location;
}

module.exports = { multerUpload, resizeImage, uploadToS3 };
