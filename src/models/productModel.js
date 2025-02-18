/**
 * Updated by ThaiDuowng's author on Feb 16 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const PRODUCT_COLLECTION_NAME = 'products'

const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().min(3).max(256).trim().strict().default(''),
  price: Joi.number().required().min(1000).max(1000000000),
  categoryId: Joi.string(),
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
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId')
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Product {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.name = data.name
    this.slug = data.slug
    this.description = data.description || ''
    this.price = data.price
    this.categoryId = data.categoryId
    this.stock = data.stock
    this.sizes = data.sizes || []
    this.colors = data.colors || []
    this.offerIds = data.offerIds || []
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  isAvailable() {
    return this.stock > 0
  }

  reduceStock(quantity) {
    if (this.stock >= quantity) {
      this.stock -= quantity
      this.updatedAt = Date.now()
      return true
    }
    return false
  }

  getFinalPrice(discount = 0) {
    return Math.max(0, this.price - discount)
  }

  toJSON() {
    return {
      _id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      price: this.price,
      categoryId: this.categoryId,
      stock: this.stock,
      sizes: this.sizes,
      colors: this.colors,
      offerIds: this.offerIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class ProductModel {
  static async getAll() {
    try {
      const products = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find().toArray()
      return products.map(product => new Product(product)) // Chuyển đổi thành object Product
    } catch (error) {
      throw new Error(error)
    }
  }

  static async createNew(data) {
    try {
      const validData = await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
      const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(validData)
      return { insertedId: result.insertedId }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ _id: objectId })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async getDetails(id) {
    return await ProductModel.findOneById(id)
  }

  static async getDetailsBySlug(slug) {
    try {
      const product = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({ slug })
      return product ? new Product(product) : null
    } catch (error) {
      throw new Error(error)
    }
  }
}

export const productModel = {
  name: PRODUCT_COLLECTION_NAME,
  schema: PRODUCT_COLLECTION_SCHEMA,
  getAll: ProductModel.getAll,
  createNew: ProductModel.createNew,
  findOneById: ProductModel.findOneById,
  getDetails: ProductModel.getDetails,
  getDetailsBySlug: ProductModel.getDetailsBySlug
}
