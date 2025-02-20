import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(productValidation.createNew, productController.createNew)

Router.route('/:id')
  .get(productController.getDetails)
  // .put(productController.updateProducts)
  // .delete(productController.deleteProducts)

Router.route('/GetDetailsBySlug/:slug')
  .get(productController.getDetailsBySlug)

Router.route('/GetProductsByCategoryId/:categoryId')
  .get(productController.getAllProductByCategoryId)

export const productRoute = Router
