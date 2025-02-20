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
  paymentMethod: Joi.string().valid('COD', 'Credit Card').required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Order {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.userId = data.userId
    this.items = data.items || []
    this.totalAmount = data.totalAmount || 0
    this.status = data.status || 'pending'
    this.paymentMethod = data.paymentMethod
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  getTotalAmount() {
    let total =+ this.items.map(item => { return (item.quantity * item.price) })
    return total
  }

  toJSON() {
    return {
      _id: this.id,
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class OrderModel {
  static async getAll() {
    try {
      const orders = await GET_DB().collection(ORDER_COLLECTION_NAME).find().toArray()
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
      return await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({ _id: objectId })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async getDetails(id) {
    const order = await this.findOneById(id)
    return order
  }
}
export const orderModel = {
  name: ORDER_COLLECTION_NAME,
  schema: ORDER_COLLECTION_SCHEMA,
  Order,
  getAll: OrderModel.getAll,
  createNew: OrderModel.createNew,
  findOneById: OrderModel.findOneById,
  getDetails: OrderModel.getDetails
}
