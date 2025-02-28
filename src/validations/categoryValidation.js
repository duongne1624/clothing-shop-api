/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().min(1).max(100).trim().strict().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least {#limit} characters',
      'string.max': 'Name cannot exceed {#limit} characters',
      'string.trim': 'Name should not contain leading or trailing whitespaces'
    }),

    description: Joi.string().max(256).trim().strict().messages({
      'string.max': 'Description cannot exceed {#limit} characters'
    }),

    parent: Joi.alternatives().try(Joi.string().hex().length(24), Joi.allow(null)).default(null).messages({
      'string.hex': 'Parent ID must be a valid ObjectId',
      'string.length': 'Parent ID must be exactly 24 characters'
    }),

    children: Joi.array().items(Joi.string().hex().length(24)).default([]).messages({
      'array.includes': 'Children IDs must be valid ObjectIds'
    }),

    _destroy: Joi.boolean().default(false).messages({
      'boolean.base': 'Destroy flag must be a boolean value'
    }),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
  })

  try {
    const validatedData = await correctValidation.validateAsync(req.body, { abortEarly: false })

    // Nếu danh mục có parent, thì không thể đánh dấu _destroy: true
    if (validatedData.parent && validatedData._destroy) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'A subcategory cannot be deleted when it has a parent category')
    }

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const categoryValidation = {
  createNew
}
