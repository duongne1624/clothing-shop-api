import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

const Router = express.Router()

Router.route('/')
  // Get all products
  .get(productController.getAll)
  // Create new product
  .post(productValidation.createNew, productController.createNew)

Router.route('/:id')
  // Get product details
  .get(productController.getDetails)
  // .put(productController.updateProducts)
  // .delete(productController.deleteProducts)

Router.route('/GetDetailsBySlug/:slug')
  // Get product details by slug
  .get(productController.getDetailsBySlug)

export const productRoute = Router
