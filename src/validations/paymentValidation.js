/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    orderId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required().messages({
      'any.required': 'Order ID is required'
    }),

    amount: Joi.number().required().min(1000).messages({
      'any.required': 'Amount is required',
      'number.min': 'Amount must be at least {#limit}'
    }),

    paymentMethod: Joi.string().valid('zalopay', 'momo', 'vnpay', 'cod').required().messages({
      'any.required': 'Payment method is required',
      'any.only': 'Invalid payment method'
    }),

    status: Joi.string().valid('pending', 'success', 'failed').default('pending'),
    transactionId: Joi.string().allow(null, ''),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
  })

  try {
    await correctValidation.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const paymentValidation = {
  createNew
}
