import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productRoute } from './productRoute'
import { userRoute } from './userRoute'
import { categoryRoute } from './categoryRoute'
import { couponRoute } from './couponRoute'
import { orderRoute } from './orderRouter'
import { paymentRoute } from './paymentRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use.' })
})

Router.use('/products', productRoute)
Router.use('/users', userRoute)
Router.use('/categories', categoryRoute)
Router.use('/coupons', couponRoute)
Router.use('/orders', orderRoute)
Router.use('/payments', paymentRoute)

export const APIs_V1 = Router
