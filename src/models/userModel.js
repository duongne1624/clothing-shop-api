/**
 * Updated by ThaiDuowng's author on Feb 12 2025
 */

import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (Name & Schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  email: Joi.string().required().email().trim().strict(),
  password: Joi.string().required().min(6).trim(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be 10-11 digits'),
  address: Joi.string().max(255).trim().strict(),
  role: Joi.string().valid('customer', 'admin').default('customer'),
  offerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const userModel = {
  name: USER_COLLECTION_NAME,
  schema: USER_COLLECTION_SCHEMA
}
