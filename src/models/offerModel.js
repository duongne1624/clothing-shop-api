/**
 * Updated by ThaiDuowng's author on Feb 12 2025
 */

import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (Name & Schema)
const OFFER_COLLECTION_NAME = 'offers'
const OFFER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  description: Joi.string().max(256).trim().strict(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().required().min(1),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  productIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  categoryIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  userIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const offerModel = {
  name: OFFER_COLLECTION_NAME,
  schema: OFFER_COLLECTION_SCHEMA
}
