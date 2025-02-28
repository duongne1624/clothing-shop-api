import express from 'express'
import { paymentValidation } from '~/validations/paymentValidation'
import { paymentController } from '~/controllers/paymentController'

const Router = express.Router()

Router.route('/')
  .post(paymentValidation.createNew, paymentController.createNew)

Router.route('/:transactionId')
  .get(paymentController.getPaymentStatus)

Router.route('/update/:orderId')
  .post(paymentController.updatePaymentStatus)

export const paymentRoute = Router
