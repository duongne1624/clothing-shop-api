/**
 * Updated by ThaiDuowng's author on Mar 03 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const COUPON_COLLECTION_NAME = 'coupons'

const COUPON_COLLECTION_SCHEMA = Joi.object({
  code: Joi.string().required().trim().uppercase(),
  type: Joi.string().valid('percentage', 'fixed').required(),
  value: Joi.number().required().min(1),
  maxDiscount: Joi.number().min(0).default(null),
  minOrder: Joi.number().min(0).default(0),
  usageLimit: Joi.number().min(1).default(null),
  usedCount: Joi.number().min(0).default(0),
  expiresAt: Joi.date().timestamp('javascript'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Coupon {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.code = data.code
    this.type = data.type
    this.value = data.value
    this.maxDiscount = data.maxDiscount || null
    this.minOrder = data.minOrder || 0
    this.usageLimit = data.usageLimit || null
    this.usedCount = data.usedCount || 0
    this.expiresAt = data.expiresAt
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  isValid(orderAmount) {
    return (
      !this._destroy &&
      this.usedCount < (this.usageLimit || Infinity) &&
      new Date() < new Date(this.expiresAt) &&
      orderAmount >= this.minOrder
    )
  }

  applyDiscount(orderAmount) {
    if (!this.isValid(orderAmount)) return 0

    let discount = this.type === 'percent'
      ? (orderAmount * this.value) / 100
      : this.value

    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount
  }

  toJSON() {
    return {
      _id: this.id,
      code: this.code,
      type: this.type,
      value: this.value,
      maxDiscount: this.maxDiscount,
      minOrder: this.minOrder,
      usageLimit: this.usageLimit,
      usedCount: this.usedCount,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class CouponModel {
  static async getAll() {
    try {
      const coupons = await GET_DB().collection(COUPON_COLLECTION_NAME).find().toArray()
      return coupons.map(coupon => new Coupon(coupon))
    } catch (error) {
      throw new Error(error)
    }
  }

  static async createNew(data) {
    try {
      const validData = await COUPON_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
      const result = await GET_DB().collection(COUPON_COLLECTION_NAME).insertOne(validData)
      return { insertedId: result.insertedId }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneByCode(code) {
    try {
      return await GET_DB().collection(COUPON_COLLECTION_NAME).findOne({ code })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneById(id) {
    try {
      return await GET_DB().collection(COUPON_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async incrementUsage(code) {
    try {
      return await GET_DB().collection(COUPON_COLLECTION_NAME).updateOne(
        { code },
        { $inc: { usedCount: 1 }, $set: { updatedAt: Date.now() } }
      )
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updateById(id, data) {
    try {
      return await GET_DB().collection(COUPON_COLLECTION_NAME).updateOne({ _id: new ObjectId(id) }, { $set: data })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async deleteById(id) {
    try {
      return await GET_DB().collection(COUPON_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
    } catch (error) {
      throw new Error(error)
    }
  }
}

export const couponModel = {
  name: COUPON_COLLECTION_NAME,
  schema: COUPON_COLLECTION_SCHEMA,
  Coupon,
  getAll: CouponModel.getAll,
  createNew: CouponModel.createNew,
  findOneByCode: CouponModel.findOneByCode,
  findOneById: CouponModel.findOneById,
  incrementUsage: CouponModel.incrementUsage,
  updateById: CouponModel.updateById,
  deleteById: CouponModel.deleteById
}
