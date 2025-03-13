import express from 'express'
import { saleController } from '~/controllers/saleController'

const Router = express.Router()

Router.get('/revenue', saleController.getTotalRevenue)
Router.get('/category-sales', saleController.getCategorySales)
Router.get('/top-products', saleController.getTopSellingProducts)

export const SaleRoute = Router