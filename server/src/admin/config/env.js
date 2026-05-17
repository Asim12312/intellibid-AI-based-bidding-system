const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.JWT_ACCESS_SECRET && !isProduction) {
  process.env.JWT_ACCESS_SECRET = 'intellibid-dev-access-secret-min-32-chars-long';
}
if (!process.env.JWT_REFRESH_SECRET && !isProduction) {
  process.env.JWT_REFRESH_SECRET = 'intellibid-dev-refresh-secret-min-32-chars-long';
}
if (!process.env.JWT_SECRET && !isProduction) {
  process.env.JWT_SECRET = 'intellibid-dev-main-auth-secret-min-32-chars';
}

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGOURL ||
  'mongodb://127.0.0.1:27017/intellibid';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  mongodbUri: mongoUri,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  frontendUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@intellibid.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    name: process.env.SEED_ADMIN_NAME || 'Admin User',
  },
};

export const isCloudinaryConfigured = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

export function assertAdminEnv() {
  if (!env.mongodbUri) {
    throw new Error('Missing MONGODB_URI or MONGO_URI');
  }
  if (!env.jwtAccessSecret || !env.jwtRefreshSecret) {
    throw new Error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET');
  }
}
