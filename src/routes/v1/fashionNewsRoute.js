import express from 'express'
import { fashionNewsController } from '~/controllers/fashionNewsController'
import { fashionNewsValidation } from '~/validations/fashionNewsValidation'

const Router = express.Router()

Router.route('/')
  .get(fashionNewsController.getAll)
  .post(fashionNewsValidation.createNew, fashionNewsController.createNew)

Router.route('/:id')
  .get(fashionNewsController.getDetails)
  .put(fashionNewsValidation.update, fashionNewsController.update)
  .delete(fashionNewsController.deleteNews)

Router.route('/slug/:slug')
  .get(fashionNewsController.getDetailsBySlug)

export const fashionNewsRoute = Router