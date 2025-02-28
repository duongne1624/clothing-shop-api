/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */

import { paymentModel } from '~/models/paymentModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newPayment = await paymentModel.createNew(reqBody)
    return newPayment
  } catch (error) { throw error }
}

const getPaymentStatus = async (transactionId) => {
  try {
    const payment = await paymentModel.getPaymentStatus(transactionId)
    if (!payment) throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    return payment
  } catch (error) { throw error }
}

const updatePaymentStatus = async (orderId, status, transactionId) => {
  try {
    const updatedPayment = await paymentModel.updatePaymentStatus(orderId, status, transactionId)
    if (!updatedPayment) throw new ApiError(StatusCodes.NOT_FOUND, 'Payment update failed')
    return updatedPayment
  } catch (error) { throw error }
}

const updateById = async (paymentId, updateData) => {
  try {
    const updatedPayment = await paymentModel.updateById(paymentId, updateData)
    if (!updatedPayment) throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    return updatedPayment
  } catch (error) { throw error }
}

const deleteById = async (paymentId) => {
  try {
    const deletedPayment = await paymentModel.deleteById(paymentId)
    if (!deletedPayment) throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    return deletedPayment
  } catch (error) { throw error }
}

export const paymentService = {
  createNew,
  getPaymentStatus,
  updatePaymentStatus,
  updateById,
  deleteById
}
