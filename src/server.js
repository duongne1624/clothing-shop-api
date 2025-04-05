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
import SubscriberService from '~/services/subscriberService'
import path from 'path'
import http from 'http'
const socketConnection = require('./config/socket')
const chatRoutes = require('./routes/v1/chatRoute')
const { ChatMessageObserver, ChatNotificationObserver } = require('./observers/chatObserver')
const chatService = require('./services/chatService')
const notificationService = require('./services/notificationService')

const START_SERVER = () => {
  const app = express()
  
  // Cấu hình CORS
  app.use(cors(corsOptions))

  // Middleware CORS cho file tĩnh (uploads, video)
  if (env.BUILD_MODE === 'production') {
    app.use('/uploads', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type')
      next()
    }, express.static(path.join(__dirname, '../../public/uploads')))

    app.use('/video', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type')
      next()
    }, express.static(path.join(__dirname, '../../public/video')))
  }
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
  }, express.static(path.join(__dirname, '../public/uploads')))

  app.use('/video', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
  }, express.static(path.join(__dirname, '../public/video')))

  app.use(express.json())

  // Khởi tạo dịch vụ đăng ký
  SubscriberService.getSubscribers()

  // Đăng ký các routes
  app.use('/v1', APIs_V1)
  app.use('/api/chat', chatRoutes)
  app.get('/', (req, res) => {
    res.json({
      message: 'Chat API Server Shop',
      version: '1.0.0'
    })
  })

  app.use(errorHandlingMiddleware)

  // Tạo HTTP server từ Express app
  const server = http.createServer(app)
  
  // Khởi tạo Socket.IO trên server
  const io = socketConnection.initialize(server)
  
  // Khởi tạo các observers cho chat
  new ChatMessageObserver(chatService)
  new ChatNotificationObserver(notificationService)

  // Bắt đầu lắng nghe trên server
  if (env.BUILD_MODE === 'production') {
    const PORT = process.env.PORT || 8017
    server.listen(PORT, () => {
      console.log(chalk.green.bold(`Backend Server is running at port: ${PORT}`))
    })
  } else if (env.BUILD_MODE === 'dev') {
    server.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(chalk.green.bold(`Backend Server is running at http://${env.APP_HOST}:${env.APP_PORT}/`))
    })
  }

  // Xử lý đóng server an toàn
  exitHook(async () => {
    console.log(chalk.yellow('Shutting down server...'))

    await new Promise((resolve) => server.close(resolve))

    console.log(chalk.blue('Disconnecting from MongoDB Cloud Atlas...'))
    await CLOSE_DB()
  })
}

// Khởi động server
(async () => {
  try {
    await CONNECT_DB()
    START_SERVER()
  } catch (error) {
    console.error(chalk.red('❌  Error starting the server:'), error)
    process.exit(1)
  }
})()