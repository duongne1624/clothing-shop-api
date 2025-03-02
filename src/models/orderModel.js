/**
 * Updated by ThaiDuowng's author on Feb 12 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'

const ORDER_COLLECTION_NAME = 'orders'
const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().default('Khách hàng'),
  phone: Joi.string().default(''),
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
  totalAmount: Joi.number().required().min(1000),
  status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending'),
  paymentMethod: Joi.string().required(),
  shippingFee: Joi.number().default(30000),
  note: Joi.string().default(''),
  discountCode: Joi.string().allow('').default(''),
  discountAmount: Joi.number().default(0),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Order {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.userId = data.userId
    this.name = data.name || 'Khách hàng'
    this.phone = data.phone || ''
    this.address = data.address || ''
    this.items = data.items || []
    this.totalAmount = data.totalAmount || 0
    this.status = data.status || 'pending'
    this.paymentMethod = data.paymentMethod
    this.shippingFee = data.shippingFee || 30000
    this.note = data.note || ''
    this.discountCode = data.discountCode || ''
    this.discountAmount = data.discountAmount || 0
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  getTotalAmount() {
    return this.items.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  toJSON() {
    return {
      _id: this.id,
      userId: this.userId,
      name: this.name,
      phone: this.phone,
      address: this.address,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      paymentMethod: this.paymentMethod,
      shippingFee: this.shippingFee,
      note: this.note,
      discountCode: this.discountCode,
      discountAmount: this.discountAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class OrderModel {
  static async getAll() {
    try {
      const orders = await GET_DB().collection(ORDER_COLLECTION_NAME).find({ _destroy: false }).toArray()
      return orders.map(order => new Order(order))
    } catch (error) {
      throw new Error(error)
    }
  }

  static async createNew(data) {
    try {
      const validData = await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
      const result = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(validData)
      return { insertedId: result.insertedId }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      return await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({ _id: objectId, _destroy: false })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async getDetails(id) {
    return this.findOneById(id)
  }

  static async updateById(id, updateData) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      const result = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: updateData })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }

  static async deleteById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      const result = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: { _destroy: true } })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }
}

export const orderModel = {
  name: ORDER_COLLECTION_NAME,
  schema: ORDER_COLLECTION_SCHEMA,
  Order,
  getAll: OrderModel.getAll,
  createNew: OrderModel.createNew,
  findOneById: OrderModel.findOneById,
  getDetails: OrderModel.getDetails,
  updateById: OrderModel.updateById,
  deleteById: OrderModel.deleteById
}
