/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */

import { GET_DB } from '../config/mongodb'
import Joi from 'joi'
import { ObjectId } from 'mongodb'

const USER_COLLECTION_NAME = 'users'

const USER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  username: Joi.string().required().min(3).max(100).trim().strict(),
  email: Joi.string().required().email().trim().strict(),
  password: Joi.string().required().min(6).trim(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).message('Phone number must be 10 digits'),
  address: Joi.string().max(255).trim().strict(),
  role: Joi.string().valid('customer', 'admin').default('customer'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

class User {
  constructor(data) {
    this.id = data._id ? new ObjectId(data._id) : null
    this.name = data.name
    this.username = data.username
    this.email = data.email
    this.password = data.password
    this.phone = data.phone || null
    this.address = data.address || ''
    this.role = data.role || 'customer'
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || null
    this._destroy = data._destroy || false
  }

  isAdmin() {
    return this.role === 'admin'
  }

  async update(updateData) {
    try {
      const updatedFields = {
        ...updateData,
        updatedAt: Date.now()
      }
      await GET_DB().collection(USER_COLLECTION_NAME).updateOne({ _id: this.id }, { $set: updatedFields })
      Object.assign(this, updatedFields)
      return this
    } catch (error) {
      throw new Error(error)
    }
  }

  async delete() {
    try {
      await GET_DB().collection(USER_COLLECTION_NAME).updateOne({ _id: this.id }, { $set: { _destroy: true } })
      this._destroy = true
      return this
    } catch (error) {
      throw new Error(error)
    }
  }

  toJSON() {
    return {
      _id: this.id,
      name: this.name,
      username: this.username,
      email: this.email,
      phone: this.phone,
      address: this.address,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _destroy: this._destroy
    }
  }
}

class UserModel {
  static async getAll() {
    try {
      const users = await GET_DB().collection(USER_COLLECTION_NAME).find({ username: { $ne : null }, role: 'customer', _destroy: false }).toArray()
      return users.map(user => new User(user))
    } catch (error) {
      throw new Error(error)
    }
  }

  static async createNew(data) {
    try {
      const validData = await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
      const result = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
      return { insertedId: result.insertedId }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: objectId, _destroy: false })
      return user ? new User(user) : null
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findOneByUsername(username) {
    try {
      const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ username: username, _destroy: false })
      return user ? new User(user) : null
    } catch (error) {
      throw new Error(error)
    }
  }

  static async findByEmail(email) {
    try {
      const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: email, _destroy: false })
      return user ? new User(user) : null
    } catch (error) {
      throw new Error(error)
    }
  }

  static async updateById(id, updateData) {
    try {
      const objectId = new ObjectId(id)
      const updatedFields = {
        ...updateData,
        updatedAt: Date.now()
      }
      await GET_DB().collection(USER_COLLECTION_NAME).updateOne({ _id: objectId }, { $set: updatedFields })
      return { success: true }
    } catch (error) {
      throw new Error(error)
    }
  }

  static async deleteById(id) {
    try {
      const objectId = new ObjectId(id)
      await GET_DB().collection(USER_COLLECTION_NAME).updateOne({ _id: objectId }, { $set: { _destroy: true } })
      return { success: true }
    } catch (error) {
      throw new Error(error)
    }
  }
}

export const userModel = {
  name: USER_COLLECTION_NAME,
  schema: USER_COLLECTION_SCHEMA,
  User,
  getAll: UserModel.getAll,
  createNew: UserModel.createNew,
  findOneById: UserModel.findOneById,
  findOneByUsername: UserModel.findOneByUsername,
  findByEmail: UserModel.findByEmail,
  updateById: UserModel.updateById,
  deleteById: UserModel.deleteById
}
