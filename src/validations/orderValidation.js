import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const createOrderSchema = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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
  paymentMethod: Joi.string().valid('cod', 'vnpay', 'shopeepay', 'momo').required()
})
