/**
 * Updated by ThaiDuowng's author on Feb 16 2025
 */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name is not allowed to be empty',
      'string.min': 'Name length must be at least {#limit} characters long',
      'string.max': 'Name length must be at most {#limit} characters long',
      'string.trim': 'Name should not contain leading or trailing whitespaces'
    }),

    username: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Username is required',
      'string.empty': 'Username is not allowed to be empty',
      'string.min': 'Username length must be at least {#limit} characters long',
      'string.max': 'Username length must be at most {#limit} characters long'
    }),

    email: Joi.string().required().email().trim().strict().messages({
      'any.required': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email is not allowed to be empty'
    }),

    password: Joi.string().required().min(6).trim().messages({
      'any.required': 'Password is required',
      'string.empty': 'Password is not allowed to be empty',
      'string.min': 'Password must be at least {#limit} characters long'
    }),

    phone: Joi.string().pattern(/^[0-9]{10,11}$/).messages({
      'string.pattern.base': 'Phone number must be 10-11 digits'
    }),

    address: Joi.string().max(255).trim().strict().messages({
      'string.max': 'Address length must be at most {#limit} characters long'
    }),

    role: Joi.string().valid('customer', 'admin').default('customer').messages({
      'any.only': 'Role must be either "customer" or "admin"'
    }),

    offerIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
  })

  try {
    // Chỉ định abortEarly: false để hiển thị tất cả lỗi validation
    await correctValidation.validateAsync(req.body, { abortEarly: false })

    // Dữ liệu hợp lệ thì cho phép request tiếp tục đến Controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = {
  createNew
}
