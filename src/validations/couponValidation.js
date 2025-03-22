/**
 * Updated by ThaiDuowng's author on Feb 12 2025
 */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    code: Joi.string().required().min(3).max(20).trim().strict().messages({
      'any.required': 'Coupon code is required',
      'string.empty': 'Coupon code is not allowed to be empty',
      'string.min': 'Coupon code length must be at least {#limit} characters long',
      'string.max': 'Coupon code length must be at most {#limit} characters long'
    }),

    type: Joi.string().valid('percentage', 'fixed').required().messages({
      'any.required': 'Discount type is required',
      'any.only': 'Discount type must be either percentage or fixed'
    }),

    value: Joi.number().required().min(1).messages({
      'any.required': 'Discount value is required',
      'number.min': 'Discount value must be greater than 0'
    }),

    minOrder: Joi.number().min(0).default(0).messages({
      'number.min': 'Minimum order value cannot be negative'
    }),

    maxDiscount: Joi.number().min(0).messages({
      'number.min': 'Maximum discount cannot be negative'
    }),

    usageLimit: Joi.number().integer().min(1).default(1).messages({
      'number.min': 'Usage limit must be at least 1'
    }),

    expiresAt: Joi.date().greater('now').messages({
      'date.greater': 'Expiration date must be in the future'
    }),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
  })

  try {
    await correctValidation.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const couponValidation = {
  createNew
}
