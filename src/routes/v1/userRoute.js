import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'

const Router = express.Router()

Router.route('/')
  .get(userController.getAll)
  .post(userValidation.createNew, userController.createNew)

Router.route('/:id')
  .get(userController.getDetails)
  .put(userController.updateUser)
  .delete(userController.deleteUser)

Router.post('/register', userController.register)
Router.post('/login', userController.login)

export const userRoute = Router
