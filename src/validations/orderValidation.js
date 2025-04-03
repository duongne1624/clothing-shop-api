// Order validation

import Joi from 'joi'

import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const createOrderSchema = Joi.object({
  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),
  name: Joi.string().required(),
  phone: Joi.string().allow('').required(),
  email: Joi.string().email().allow('').required(),
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
  amount: Joi.number().required().min(1000),
  status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
  paymentMethod: Joi.string().required().valid('zalopay', 'momo', 'vnpay', 'cod'),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending'),
  discountCode: Joi.string().allow('').default(''),
  discountAmount: Joi.number().default(0),
  lastAmount: Joi.number().required().min(1000),
  redirecturl: Joi.string().allow('').default('')
})