/* eslint-disable no-console */

//Kết nối cơ sở dữ liệu

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment.js'
import chalk from 'chalk'

let shopDatabaseInstance = null

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Singleton
export const CONNECT_DB = async () => {
  console.log(chalk.yellow('Connecting to MongoDB Cloud Atlas...'))
  await client.connect()
  shopDatabaseInstance = client.db(env.DATABASE_NAME)
  console.log(chalk.green('Connected to MongoDB Cloud Atlas!'))
}

export const GET_DB = () => {
  if (!shopDatabaseInstance) throw new Error('Database not connected!')
  return shopDatabaseInstance
}

export const CLOSE_DB = async () => {
  await client.close()
  console.log(chalk.red('❌ Disconnected from MongoDB Cloud Atlas'))
}
