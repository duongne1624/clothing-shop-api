/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const CATEGORY_COLLECTION_NAME = 'categories'

const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(1).max(100).trim().strict(),
  slug: Joi.string().min(1).trim().strict(),
  description: Joi.string().max(256).trim().strict().default(''),
  parent: Joi.alternatives().try(Joi.string().hex().length(24), Joi.allow(null)).default(null),
  children: Joi.array().items(Joi.string().hex().length(24)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Category {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.name = data.name
    this.slug = data.slug
    this.description = data.description || ''
    this.parent = data.parent ? new ObjectId(data.parent) : null
    this.children = (data.children || []).map(id => new ObjectId(id))
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  toJSON() {
    return {
      _id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      parent: this.parent,
      children: this.children,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class CategoryModel {
  static async getAll() {
    try {
      const categories = await GET_DB().collection(CATEGORY_COLLECTION_NAME)
        .find({ _destroy: false })
        .toArray()
      return categories.map(category => new Category(category))
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async createNew(data) {
    try {
      const validData = await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })

      // Chuyển đổi ObjectId cho parent nếu có
      if (validData.parent) {
        validData.parent = new ObjectId(validData.parent)

        // Cập nhật danh mục cha để thêm vào danh sách `children`
        await GET_DB().collection(CATEGORY_COLLECTION_NAME).updateOne(
          { _id: validData.parent },
          { $push: { children: validData._id } }
        )
      }

      const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).insertOne(validData)
      return { insertedId: result.insertedId }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async findOneById(id) {
    try {
      const objectId = new ObjectId(id)
      return await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ _id: objectId })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async GetNameById(id) {
    try {
      const objectId = new ObjectId(id)
      const category = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ _id: objectId })
      return category.name
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updateById(id, updateData) {
    try {
      const objectId = new ObjectId(id)
      if (updateData.parent) {
        updateData.parent = new ObjectId(updateData.parent)
      }
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
      const objectId = new ObjectId(id)

      // Xóa danh mục con trước khi xóa danh mục cha
      await GET_DB().collection(CATEGORY_COLLECTION_NAME).updateMany(
        { parent: objectId },
        { $set: { _destroy: true } }
      )

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
      const category = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ slug: slug })
      return category
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getChildrenCategories(parentId) {
    try {
      const objectId = new ObjectId(parentId)
      const categories = await GET_DB().collection(CATEGORY_COLLECTION_NAME)
        .find({ parent: objectId, _destroy: false })
        .toArray()
      return categories
    } catch (error) {
      throw new Error(error.message)
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
  GetNameById: CategoryModel.GetNameById,
  updateById: CategoryModel.updateById,
  deleteById: CategoryModel.deleteById,
  getDetailsBySlug: CategoryModel.getDetailsBySlug,
  getChildrenCategories: CategoryModel.getChildrenCategories
}
