import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME || process.env.MONGODB_DB_NAME || "mahila-bachatgat";
const mongoBaseUri = process.env.MONGODB_URI || process.env.MONGODB_MAIN_URI || "mongodb://127.0.0.1:27017";

const normalizeMongoUri = (uri, name) => {
  if (!uri) return `mongodb://127.0.0.1:27017/${name}`;

  const withoutTrailingSlash = uri.endsWith("/") ? uri.slice(0, -1) : uri;
  const lastSegment = withoutTrailingSlash.split("/").pop();
  const hasDbName = lastSegment && !lastSegment.includes(":") && lastSegment !== "";

  if (!hasDbName) {
    return `${withoutTrailingSlash}/${name}`;
  }

  return withoutTrailingSlash.replace(/\/[^/]+$/, `/${name}`);
};

const config = {
  port: process.env.PORT || 5000,
  mongoUri: normalizeMongoUri(mongoBaseUri, dbName),
  mongoBaseUri,
  dbName,
  jwtSecret: process.env.JWT_SECRET || "mahila-bachatgat-super-secret-key",
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    id: process.env.EMAIL_ID || "",
    passkey: process.env.EMAIL_PASSKEY || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || process.env.CLOUDINARY_FOLDER_NAME || "mahila-bachatgat",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default config;
