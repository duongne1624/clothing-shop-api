/**
 * Updated by ThaiDuowng's author on Feb 18 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const CATEGORY_COLLECTION_NAME = 'categories'

const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(1).max(100).trim().strict(),
  slug: Joi.string().required().min(1).trim().strict(),
  description: Joi.string().max(256).trim().strict().default(''),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Category {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.name = data.name
    this.description = data.description || ''
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  toJSON() {
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class CategoryModel {
  static async getAll() {
    try {
      const categories = await GET_DB().collection(CATEGORY_COLLECTION_NAME).find().toArray()
      return categories.map(category => new Category(category))
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async createNew(data) {
    try {
      const validData = await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
      const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).insertOne(validData)
      return { insertedId: result.insertedId }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async findOneById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      return await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ _id: objectId })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updateById(id, updateData) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      const result = await GET_DB()
        .collection(CATEGORY_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: updateData })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      const result = await GET_DB()
        .collection(CATEGORY_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: { _destroy: true } })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getDetailsBySlug(slug) {
    try {
      const category = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ slug })
      return category
    } catch (error) {
      throw new Error(error)
    }
  }
}

export const categoryModel = {
  name: CATEGORY_COLLECTION_NAME,
  schema: CATEGORY_COLLECTION_SCHEMA,
  Category,
  getAll: CategoryModel.getAll,
  createNew: CategoryModel.createNew,
  findOneById: CategoryModel.findOneById,
  updateById: CategoryModel.updateById,
  deleteById: CategoryModel.deleteById,
  getDetailsBySlug: CategoryModel.getDetailsBySlug
}
