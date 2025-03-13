/**
 * Updated by ThaiDuowng's author on Feb 12 2025
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

    description: Joi.string().min(3).max(256).trim().strict().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description is not allowed to be empty',
      'string.min': 'Description length must be at least {#limit} characters long',
      'string.max': 'Description length must be at most {#limit} characters long'
    }),

    price: Joi.number().required().min(1000).max(1000000000).messages({
      'any.required': 'Price is required',
      'number.empty': 'Price is not allowed to be empty',
      'number.min': 'Price must be at least {#limit}',
      'number.max': 'Price must be at most {#limit}'
    }),

    categoryId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).messages({
      'any.required': 'Category ID is required'
    }),

    stock: Joi.number().required().min(0).messages({
      'any.required': 'Stock is required',
      'number.min': 'Stock cannot be negative'
    }),

    sizes: Joi.array().items(Joi.string().valid('S', 'M', 'L', 'XL', 'XXL')).default([]).messages({
      'array.includes': 'Sizes must be one of S, M, L, XL, XXL'
    }),

    sold: Joi.number().min(0).default(0).messages({
      'number.min': 'Stock cannot be negative'
    }),

    colors: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim().messages({
          'any.required': 'Color name is required'
        }),
        colorCode: Joi.string().required().pattern(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).message('Invalid hex color code'),
        images: Joi.array().items(Joi.string().uri()).default([]).messages({
          'array.includes': 'Each image must be a valid URI'
        })
      })
    ).default([]).messages({
      'array.includes': 'Each color must be an object containing name, colorCode, and images'
    }),

    offerIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

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

export const productValidation = {
  createNew
}
