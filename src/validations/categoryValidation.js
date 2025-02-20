/**
 * Updated by ThaiDuowng's author on Feb 20 2025
 */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().min(1).max(100).trim().strict().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name is not allowed to be empty',
      'string.min': 'Name length must be at least {#limit} characters long',
      'string.max': 'Name length must be at most {#limit} characters long',
      'string.trim': 'Name should not contain leading or trailing whitespaces'
    }),

    description: Joi.string().min(0).max(256).trim().strict().messages({
      'any.required': 'Description is required',
      'string.min': 'Description length must be at least {#limit} characters long',
      'string.max': 'Description length must be at most {#limit} characters long'
    }),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
  })

  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctValidation.validateAsync(req.body, { abortEarly: false })

    // Dữ liệu hợp lệ thì cho phép request tiếp đến Controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const categoryValidation = {
  createNew
}
