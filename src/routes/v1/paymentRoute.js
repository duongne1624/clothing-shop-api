import express from 'express'
import paymentController from '~/controllers/paymentController'
import { paymentValidation } from '~/validations/paymentValidation'

const Router = express.Router()

Router.route('/')
  .get(paymentController.getAllPayments)
  .post(paymentValidation.createNew, paymentController.createNewPayment)

Router.route('/:id')
  .get(paymentController.getPaymentById)
  .put(paymentController.updatePaymentStatus)

Router.post('/callback/:paymentGateway', paymentController.paymentCallback)

export const paymentRoute = Router