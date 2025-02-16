import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productRoute } from './productRoute'
import { userRoute } from './userRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use.' })
})

Router.use('/products', productRoute)
Router.use('/users', userRoute)

export const APIs_V1 = Router
