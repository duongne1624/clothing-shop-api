import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(200).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title length must be at least {#limit} characters long',
      'string.max': 'Title length must be at most {#limit} characters long',
      'string.trim': 'Title must not have leading or trailing spaces'
    }),

    description: Joi.string().required().min(3).max(500).trim().strict().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description is not allowed to be empty',
      'string.min': 'Description length must be at least {#limit} characters long',
      'string.max': 'Description length must be at most {#limit} characters long'
    }),

    content: Joi.string().required().min(3).trim().strict().messages({
      'any.required': 'Content is required',
      'string.empty': 'Content is not allowed to be empty',
      'string.min': 'Content length must be at least {#limit} characters long'
    }),

    image: Joi.string().required().uri().messages({
      'any.required': 'Image URL is required',
      'string.uri': 'Image must be a valid URL'
    }),

    author: Joi.string().messages({
      'string.empty': 'Author is not allowed to be empty'
    }),

    tags: Joi.array().items(Joi.string()).messages({
      'array.base': 'Tags must be an array of strings'
    }),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(200).trim().strict().messages({
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title length must be at least {#limit} characters long',
      'string.max': 'Title length must be at most {#limit} characters long',
      'string.trim': 'Title must not have leading or trailing spaces'
    }),

    description: Joi.string().min(3).max(500).trim().strict().messages({
      'string.empty': 'Description is not allowed to be empty',
      'string.min': 'Description length must be at least {#limit} characters long',
      'string.max': 'Description length must be at most {#limit} characters long'
    }),

    content: Joi.string().min(3).trim().strict().messages({
      'string.empty': 'Content is not allowed to be empty',
      'string.min': 'Content length must be at least {#limit} characters long'
    }),

    image: Joi.string().uri().messages({
      'string.uri': 'Image must be a valid URL'
    }),

    author: Joi.string().messages({
      'string.empty': 'Author is not allowed to be empty'
    }),

    tags: Joi.array().items(Joi.string()).messages({
      'array.base': 'Tags must be an array of strings'
    }),

    updatedAt: Joi.date().timestamp('javascript').default(Date.now)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const fashionNewsValidation = {
  createNew,
  update
} 