/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import chalk from 'chalk'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  // Cấu hình CORS
  app.use(cors(corsOptions))

  // Hỗ trợ JSON body
  app.use(express.json())

  // Định tuyến API V1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Lắng nghe server
  const server = app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(chalk.green.bold(`✅ Backend Server is running at http://${env.APP_HOST}:${env.APP_PORT}/`))
  })

  // Xử lý khi thoát ứng dụng
  exitHook(async () => {
    console.log(chalk.yellow('⚠️  Shutting down server...'))

    // Đảm bảo server đóng hoàn toàn
    await new Promise((resolve) => server.close(resolve))

    console.log(chalk.blue('🔄 Disconnecting from MongoDB Cloud Atlas...'))
    await CLOSE_DB()
    console.log(chalk.red('❌ Disconnected from MongoDB Cloud Atlas'))
  })
}

(async () => {
  try {
    console.log(chalk.cyan(`👨‍💻 Made by: ${env.AUTHOR}`))

    console.log(chalk.yellow('⏳  Connecting to MongoDB Cloud Atlas...'))
    await CONNECT_DB()
    console.log(chalk.green('✅  Connected to MongoDB Cloud Atlas!'))

    START_SERVER()
  } catch (error) {
    console.error(chalk.red('❌  Error starting the server:'), error)
    process.exit(1)
  }
})()
