import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'

const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(productValidation.createNew, productController.createNew)

Router.route('/:id')
  .get(productController.getDetails)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct)

Router.route('/GetDetailsBySlug/:slug')
  .get(productController.getDetailsBySlug)

Router.route('/GetProductsByCategoryId/:categoryId')
  .get(productController.getAllProductByCategoryId)

Router.route('/GetProductsByCategorySlug/:categorySlug')
  .get(productController.getProductsByCategorySlug)

Router.get('/Search/:keyWord', productController.searchProducts)

export const productRoute = Router
