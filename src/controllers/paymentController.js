/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */
import { StatusCodes } from 'http-status-codes'
import { paymentService } from '~/services/paymentService'

const createNew = async (req, res, next) => {
  try {
    const payment = await paymentService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(payment)
  } catch (error) {
    next(error)
  }
}

const getPaymentStatus = async (req, res, next) => {
  try {
    const transactionId = req.params.transactionId
    const payment = await paymentService.getPaymentStatus(transactionId)
    res.status(StatusCodes.OK).json(payment)
  } catch (error) {
    next(error)
  }
}

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { orderId, status, transactionId } = req.body
    const updatedPayment = await paymentService.updatePaymentStatus(orderId, status, transactionId)
    res.status(StatusCodes.OK).json(updatedPayment)
  } catch (error) {
    next(error)
  }
}

export const paymentController = {
  createNew,
  getPaymentStatus,
  updatePaymentStatus
}
