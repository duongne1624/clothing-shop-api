import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Name is required',
      'string.empty': 'Name is not allowed to be empty',
      'string.min': 'Name length must be at least {#limit} characters long',
      'string.max': 'Name length must be at least {#limit} characters long',
      'string.trim': 'Name should not contain leading or trailing whitespaces'
    }),
    price: Joi.number().required().min(1000).max(1000000000).messages({
      'any.required': 'Price is required',
      'number.empty': 'Price is not allowed to be empty',
      'number.min': 'Price must have a minimum number is {#limit}',
      'number.max': 'Price must have a maximum number is {#limit}'
    })
  })

  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctValidation.validateAsync(req.body, { abortEarly: false })

    //Validate dữ liệu hợp lệ thì cho request tiếp đến Controller
    next()
  } catch (error) { next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)) }
}

export const productValidation = {
  createNew
}
