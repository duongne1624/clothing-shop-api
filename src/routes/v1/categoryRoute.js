import express from 'express'
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(categoryValidation.createNew, categoryController.createNew)

Router.route('/:id')
  // Get category details
  .get(categoryController.getDetails)
  // .put(categoryController.updatecategorys)
  // .delete(categoryController.deletecategorys)

Router.route('/GetDetailsBySlug/:slug')
  // Get category details by slug
  .get(categoryController.getDetailsBySlug)

export const categoryRoute = Router
