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
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory)

Router.route('/GetDetailsBySlug/:slug')
  .get(categoryController.getDetailsBySlug)

Router.get('/GetHierarchy/get', categoryController.getHierarchy)

export const categoryRoute = Router
