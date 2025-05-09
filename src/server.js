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
import formatIpAddress from '~/middlewares/ipMiddleware'

const START_SERVER = () => {
  const app = express()
  let server

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

  app.use(cors(corsOptions))
  app.use(formatIpAddress)

  app.use(express.json())

  SubscriberService.getSubscribers()

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    if (process.env.PORT === undefined) process.env.PORT = 8017
    server = app.listen(process.env.PORT, () => {
      console.log(chalk.green.bold(`Backend Server is running at port: ${process.env.PORT}`))
    })
  } else if (env.BUILD_MODE === 'dev') {
    server = app.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(chalk.green.bold(`Backend Server is running at http://${env.APP_HOST}:${env.APP_PORT}/`))
    })
  }

  exitHook(async () => {
    console.log(chalk.yellow('Shutting down server...'))

    await new Promise((resolve) => server.close(resolve))

    console.log(chalk.blue('Disconnecting from MongoDB Cloud Atlas...'))
    await CLOSE_DB()
  })
}

(async () => {
  try {

    await CONNECT_DB()

    START_SERVER()
  } catch (error) {
    console.error(chalk.red('❌  Error starting the server:'), error)
    process.exit(1)
  }
})()