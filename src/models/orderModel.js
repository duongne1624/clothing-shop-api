/**
 * Updated by ThaiDuowng's author on Mar 06 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { productModel } from '~/models/productModel'
import { PaymentStrategyFactory } from '~/factories/payment.factory'

const ORDER_COLLECTION_NAME = 'orders'

const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^(0[0-9]{9})?$/).message('Số điện thoại không hợp lệ').required(),
  address: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        quantity: Joi.number().required().min(1),
        size: Joi.string().valid('S', 'M', 'L', 'XL', 'XXL').default('M'),
        color: Joi.string().trim(),
        price: Joi.number().required().min(1000)
      })
    )
    .min(1)
    .required(),
  amount: Joi.number().required().min(1000),
  status: Joi.string().valid('pending', 'shipping', 'completed', 'cancelled').default('pending'),
  paymentMethod: Joi.string().required().valid('zalopay', 'momo', 'vnpay', 'cod'),
  transactionId: Joi.string().allow(null, ''),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending'),
  paymentInfo: Joi.object().allow(null),
  discountCode: Joi.string().allow('').default(''),
  discountAmount: Joi.number().default(0),
  lastAmount: Joi.number().required().min(1000),
  redirecturl: Joi.string().allow('').default(''),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class Order {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.userId = data.userId || ''
    this.name = data.name
    this.phone = data.phone
    this.address = data.address
    this.items = data.items || []
    this.amount = data.amount || 0
    this.status = data.status || 'pending'
    this.paymentMethod = data.paymentMethod
    this.transactionId = data.transactionId || null
    this.paymentStatus = data.paymentStatus || 'unpaid'
    this.paymentInfo = data.paymentInfo || null
    this.discountCode = data.discountCode
    this.discountAmount = data.discountAmount
    this.lastAmount = data.lastAmount
    this.redirecturl = data.redirecturl || ''
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
      amount: this.amount,
      status: this.status,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      paymentStatus: this.paymentStatus,
      paymentInfo: this.paymentInfo,
      discountCode: this.discountCode,
      discountAmount: this.discountAmount,
      lastAmount: this.lastAmount,
      redirecturl: this.redirecturl,
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

  static async getAllCompleted() {
    try {
      const orders = await GET_DB().collection(ORDER_COLLECTION_NAME)
        .find({ status: 'completed', _destroy: false })
        .toArray()

      const productIds = orders.flatMap(order => order.items.map(item => item.productId))
      const products = await productModel.getAllProductIds(productIds)

      const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p.categoryId || 'unknown']))

      return orders.map(order => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          categoryId: productMap[item.productId] || 'unknown'
        }))
      }))
    } catch (error) {
      throw new Error(error)
    }
  }

  static async createNew(data) {
    try {
      const validData = await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
      validData.createdAt = Date.now()
      validData.updatedAt = null

      const paymentStrategy = PaymentStrategyFactory.create(data.paymentMethod)
      const paymentResult = await paymentStrategy.processPayment(data)

      if (paymentResult.success) {
        validData.transactionId = paymentResult.transactionId
        validData.paymentStatus = 'pending'
        validData.paymentInfo = paymentResult.paymentInfo
      } else {
        validData.paymentStatus = 'failed'
        validData.paymentInfo = paymentResult.paymentInfo
      }
      const insertValidData = new Order(validData)
      const result = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(insertValidData.toJSON())

      if (validData.paymentMethod === 'cod') insertValidData.paymentInfo.order_url = `${insertValidData.paymentInfo.order_url}?status=1&apptransid=1&orderId=${result.insertedId}`

      return {
        insertedId: result.insertedId,
        paymentInfo: insertValidData.paymentInfo
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneById(id) {
    try {
      const objectId = new ObjectId(id)
      return await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({ _id: objectId, _destroy: false })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneByAppTransId(appTransId) {
    try {
      return await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({ transactionId: appTransId })
    } catch (error) {
      throw new Error(error)
    }
  }

  static async getDetails(id) {
    return this.findOneById(id)
  }

  static async updateById(id, updateData) {
    try {
      const objectId = new ObjectId(id)
      updateData.updatedAt = Date.now()
      const result = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: updateData })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updateStatus(id) {
    try {
      const objectId = new ObjectId(id)
      const order = await this.findOneById(id)
      order.updatedAt = Date.now()

      switch (order.status) {
      case 'pending':
        order.status = 'shipping'
        break
      case 'shipping':
        order.status = 'completed'
        break
      case 'completed':
        return false
      }

      const result = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: order })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updateByAppTransId(tranId, status) {
    try {
      const updatedAt = new Date()
      const result = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .updateOne({ transactionId: tranId }, { $set: { paymentStatus: status.status, updatedAt: updatedAt } })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }

  static async deleteById(id) {
    try {
      const objectId = new ObjectId(id)
      const result = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .updateOne({ _id: objectId }, { $set: { _destroy: true, updatedAt: Date.now() } })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }

  static async getAllByUserId(userId) {
    try {
      const orders = await GET_DB()
        .collection(ORDER_COLLECTION_NAME)
        .find({ userId: userId, _destroy: false })
        .sort({ createdAt: -1 })
        .toArray()
      return orders.map(order => new Order(order))
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
  getAllCompleted: OrderModel.getAllCompleted,
  createNew: OrderModel.createNew,
  findOneById: OrderModel.findOneById,
  findOneByAppTransId: OrderModel.findOneByAppTransId,
  getDetails: OrderModel.getDetails,
  updateById: OrderModel.updateById,
  updateStatus: OrderModel.updateStatus,
  updateByAppTransId: OrderModel.updateByAppTransId,
  deleteById: OrderModel.deleteById,
  getAllByUserId: OrderModel.getAllByUserId
}
