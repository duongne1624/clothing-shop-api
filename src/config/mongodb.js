//Kết nối cơ sở dữ liệu


import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment.js'

let shopDatabaseInstance = null

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await client.connect()

  shopDatabaseInstance = client.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!shopDatabaseInstance) throw new Error('Database not connected!')
  return shopDatabaseInstance
}

export const CLOSE_DB = async () => {
  await client.close()
}
