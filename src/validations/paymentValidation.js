import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    name: Joi.string(),
    phone: Joi.string().default(''),
    address: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        quantity: Joi.number().required().min(1),
        size: Joi.string().valid('S', 'M', 'L', 'XL', 'XXL').default('M'),
        color: Joi.string().trim(),
        price: Joi.number().required().min(1000)
      })
    ).min(1),
    totalAmount: Joi.number().required().min(1000),
    status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
    paymentMethod: Joi.string().required().valid('zalopay', 'momo', 'vnpay', 'cod'),
    shippingFee: Joi.number().default(30000),
    note: Joi.string().default(''),
    discountCode: Joi.string().allow('').default(''),
    discountAmount: Joi.number().default(0),
    redirecturl: Joi.string().allow('').default('')
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