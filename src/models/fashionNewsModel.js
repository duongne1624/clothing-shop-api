import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const FASHION_NEWS_COLLECTION_NAME = 'fashion_news'

const FASHION_NEWS_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(200).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(500).trim().strict(),
  content: Joi.string().required().min(3).trim().strict(),
  image: Joi.string().required().uri(),
  author: Joi.string().default('Admin'),
  tags: Joi.array().items(Joi.string()).default([]),
  views: Joi.number().default(0),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await FASHION_NEWS_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(FASHION_NEWS_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      _destroy: false
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailsBySlug = async (slug) => {
  try {
    const result = await GET_DB().collection(FASHION_NEWS_COLLECTION_NAME).findOne({ slug })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data) => {
  try {
    const validatedData = await validateSchema(data)
    const result = await GET_DB().collection(FASHION_NEWS_COLLECTION_NAME).insertOne(validatedData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const validatedData = await validateSchema(data)
    const result = await GET_DB().collection(FASHION_NEWS_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: {
        ...validatedData,
        updatedAt: Date.now()
      } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB().collection(FASHION_NEWS_COLLECTION_NAME)
      .find({ _destroy: false })
      .sort({ createdAt: -1 })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const softDelete = async (id) => {
  try {
    const result = await GET_DB().collection(FASHION_NEWS_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: {
        _destroy: true,
        updatedAt: Date.now()
      } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const fashionNewsModel = {
  FASHION_NEWS_COLLECTION_NAME,
  FASHION_NEWS_COLLECTION_SCHEMA,
  createNew,
  update,
  getAll,
  findOneById,
  getDetailsBySlug,
  softDelete
}