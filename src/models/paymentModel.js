import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongodb'
import { PaymentStrategyFactory } from '~/factories/payment.factory'

const PAYMENT_COLLECTION_NAME = 'payments'

const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  orderId: Joi.string().pattern(new RegExp('^[0-9a-fA-F]{24}$')).message('orderId must be a valid ObjectId').default(null),
  amount: Joi.number().required().min(1000),
  paymentMethod: Joi.string().valid('zalopay', 'momo', 'vnpay', 'cod').required(),
  transactionId: Joi.string().allow(null, ''),
  status: Joi.string().valid('pending', 'success', 'failed').default('pending'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  paymentInfo: Joi.object().allow(null),
  orderDetails: Joi.object().allow(null)
})

const validateSchema = async (data) => {
  return await PAYMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

class Payment {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.orderId = data.orderId || null
    this.amount = data.amount || 0
    this.paymentMethod = data.paymentMethod
    this.transactionId = data.transactionId || null
    this.status = data.status || 'pending'
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this.paymentInfo = data.paymentInfo || null
    this.orderDetails = data.orderDetails || null
  }

  toJSON() {
    return {
      _id: this.id,
      orderId: this.orderId,
      amount: this.amount,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      paymentInfo: this.paymentInfo,
      orderDetails: this.orderDetails
    }
  }

  static async createNew(data) {
    try {
      const value = await validateSchema({
        amount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        orderDetails: data
      })

      const paymentStrategy = PaymentStrategyFactory.create(value.paymentMethod)
      const paymentResult = await paymentStrategy.processPayment(value)

      if (paymentResult.success) {
        value.transactionId = paymentResult.transactionId
        value.status = 'pending'
        if (value.paymentMethod === 'cod') {
          value.status = 'success'
        }
        value.paymentInfo = paymentResult.paymentInfo
      } else {
        value.status = 'failed'
        value.paymentInfo = paymentResult.paymentInfo
      }
      const insertValue = new Payment(value)
      const db = await GET_DB()
      const result = await db.collection(PAYMENT_COLLECTION_NAME).insertOne(insertValue.toJSON())

      return {
        insertedId: result.insertedId,
        paymentInfo: insertValue.paymentInfo
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async getAll() {
    try {
      const db = await GET_DB()
      const payments = await db.collection(PAYMENT_COLLECTION_NAME).find().toArray()
      return payments
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneById(id) {
    try {
      const db = await GET_DB()
      const payment = await db.collection(PAYMENT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
      return payment
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updateById(id, data) {
    try {
      const db = await GET_DB()
      const result = await db.collection(PAYMENT_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      )
      return result.modifiedCount
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updateByAppTransId(tranId, status) {
    try {
      const updatedAt = new Date()
      const result = await GET_DB()
        .collection(PAYMENT_COLLECTION_NAME)
        .updateOne({ transactionId: tranId }, { $set: { status: status.status, updatedAt: updatedAt } })
      return result.modifiedCount > 0
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneByAppTransId(tranId) {
    try {
      const db = await GET_DB()
      const payment = await db.collection(PAYMENT_COLLECTION_NAME).findOne({ transactionId: tranId })
      return payment
    } catch (error) {
      throw new Error(error)
    }
  }
}

export default Payment