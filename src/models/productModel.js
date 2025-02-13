/**
 * Updated by ThaiDuowng's author on Feb 12 2025
 */

import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

// Define Collection (Name & Schema)
const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().min(3).max(256).trim().strict().default(''),
  price: Joi.number().required().min(1000).max(1000000000),
  categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  stock: Joi.number().required().min(0),
  sizes: Joi.array().items(Joi.string().valid('S', 'M', 'L', 'XL', 'XXL')).default([]),

  colors: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim(),
      colorCode: Joi.string().required().pattern(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).message('Invalid hex color code'),
      images: Joi.array().items(Joi.string().uri()).default([])
    })
  ).default([]),

  offerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const getAll = async () => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).find().toArray()
  } catch (error) { throw new Error(error) }
}

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    //Thêm dữ liệu vào mongoDB
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(validData)
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}

const getDetailsBySlug = async (slug) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ slug: slug })
  } catch (error) { throw new Error(error) }
}

export const productModel = {
  name: PRODUCT_COLLECTION_NAME,
  schema: PRODUCT_COLLECTION_SCHEMA,
  getAll,
  createNew,
  findOneById,
  getDetails,
  getDetailsBySlug
}
