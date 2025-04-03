// general routes

import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { productRoute } from './productRoute'
import { userRoute } from './userRoute'
import { categoryRoute } from './categoryRoute'
import { couponRoute } from './couponRoute'
import { orderRoute } from './orderRouter'
import { SaleRoute } from './saleRoute'
import { subscriberRouter } from './subscriberRoutes'
import { uploadRoute } from './uploadRoutes'
import { fashionNewsRoute } from './fashionNewsRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use.' })
})

Router.use('/products', productRoute)
Router.use('/users', userRoute)
Router.use('/categories', categoryRoute)
Router.use('/coupons', couponRoute)
Router.use('/orders', orderRoute)
Router.use('/stats', SaleRoute)
Router.use('/subscribers', subscriberRouter)
Router.use('/uploads', uploadRoute)
Router.use('/fashion-news', fashionNewsRoute)

export const APIs_V1 = Router
