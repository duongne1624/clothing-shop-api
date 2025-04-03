import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  CALLBACK_URL: process.env.CALLBACK_URL,

  BUILD_MODE: process.env.BUILD_MODE,

  VNP_TMNCODE: process.env.VNP_TMNCODE,
  VNP_HASHSECRET: process.env.VNP_HASHSECRET,
  VNP_URL: process.env.VNP_URL,

  AUTHOR: process.env.AUTHOR
}
