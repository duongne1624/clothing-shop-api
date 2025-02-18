/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 16 2025
 */

import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { sendVerificationEmail } from '~/services/emailService'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const getAll = async () => {
  try {
    const users = await userModel.getAll()
    return users
  } catch (error) { throw error }
}

const createNew = async (reqBody) => {
  try {
    const createdUser = await userModel.createNew(reqBody)
    const getNewUser = await userModel.findOneById(createdUser.insertedId.toString())

    return getNewUser
  } catch (error) { throw error }
}

const getDetails = async (userId) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    return user
  } catch (error) { throw error }
}

const getDetailsByUsername = async (username) => {
  try {
    const user = await userModel.findOneByUsername(username)
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    return user
  } catch (error) { throw error }
}

const register = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const newUser = {
      ...userData,
      password: hashedPassword
    }

    const createdUser = await userModel.createNew(newUser)

    // Gửi email xác nhận
    await sendVerificationEmail(newUser.email, 'Welcome!', 'Cảm ơn bạn đã đăng ký tài khoản tại shop quần áo TDW!')

    return createdUser
  } catch (error) {
    throw error
  }
}

const login = async (email, password) => {
  try {
    const user = await userModel.findByEmail(email)
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email not found!')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password not corect!')

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    return { user, token }
  } catch (error) {
    throw error
  }
}

export const userService = {
  getAll,
  createNew,
  getDetails,
  getDetailsByUsername,
  register,
  login
}
