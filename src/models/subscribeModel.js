import Joi from 'joi'
import { GET_DB } from '../config/mongodb'
import { ObjectId } from 'mongodb'

const SUBSCRIBER_COLLECTION_NAME = 'subscribers'

const SUBSCRIBER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().email().trim().strict(),
  subscribedAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  isActive: Joi.boolean().default(true),
  _destroy: Joi.boolean().default(false)
})

class Subscriber {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.email = data.email
    this.subscribedAt = data.subscribedAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this.isActive = data.isActive || true
    this._destroy = data._destroy || false
  }

  async update(updateData) {
    if (updateData.email) throw new Error('Email cannot be updated')
    const updatedFields = { ...updateData, updatedAt: Date.now() }
    await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).updateOne({ _id: this.id }, { $set: updatedFields })
    Object.assign(this, updatedFields)
    return this
  }

  async delete() {
    await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).updateOne({ _id: this.id }, { $set: { _destroy: true } })
    this._destroy = true
    return this
  }

  toJSON() {
    return {
      _id: this.id,
      email: this.email,
      subscribedAt: this.subscribedAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      _destroy: this._destroy
    }
  }
}

class SubscriberModel {
  static async getAll() {
    const subscribers = await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).find({ _destroy: false }).toArray()
    return subscribers.map(sub => new Subscriber(sub))
  }

  static async createNew(email) {
    const data = { email: email }
    const validData = await SUBSCRIBER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const existingSubscriber = await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).find({ email: validData.email, _destroy: false }).limit(1).next()
    if (existingSubscriber) throw new Error('Email already subscribed')
    const result = await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).insertOne(validData)
    return { insertedId: result.insertedId }
  }

  static async findOneById(id) {
    const objectId = new ObjectId(id)
    const subscriber = await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).find({ _id: objectId, _destroy: false }).limit(1).next()
    return subscriber ? new Subscriber(subscriber) : null
  }

  static async findOneByEmail(email) {
    const subscriber = await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).find({ email: email, _destroy: false }).limit(1).next()
    return subscriber ? new Subscriber(subscriber) : null
  }

  static async updateById(id, updateData) {
    const objectId = new ObjectId(id)
    if (updateData.email) throw new Error('Email cannot be updated')
    const updatedFields = { ...updateData, updatedAt: Date.now() }
    await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).updateOne({ _id: objectId }, { $set: updatedFields })
    return { success: true }
  }

  static async unSubscribe(email) {
    const subscriber = await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).find({ email: email, _destroy: false }).limit(1).next()
    if (!subscriber) throw new Error('Email not exists.')
    const updatedFields = { isActive: false, updatedAt: Date.now() }
    await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).updateOne({ email: email }, { $set: updatedFields })
  }

  static async deleteById(id) {
    const objectId = new ObjectId(id)
    await GET_DB().collection(SUBSCRIBER_COLLECTION_NAME).updateOne({ _id: objectId }, { $set: { _destroy: true } })
    return { success: true }
  }
}

export const subscriberModel = {
  Subscriber,
  getAll: SubscriberModel.getAll,
  createNew: SubscriberModel.createNew,
  findOneById: SubscriberModel.findOneById,
  findOneByEmail: SubscriberModel.findOneByEmail,
  updateById: SubscriberModel.updateById,
  unSubscribe: SubscriberModel.unSubscribe,
  deleteById: SubscriberModel.deleteById
}