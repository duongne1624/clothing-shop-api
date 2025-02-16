/**
 * Updated by ThaiDuowng's author on Feb 16 2025
 */

import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll()
    res.status(StatusCodes.OK).json(users)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    // Gửi dữ liệu xuống Service để xử lý
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await userService.getDetails(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

const getDetailsByUsername = async (req, res, next) => {
  try {
    const username = req.params.username
    const user = await userService.getDetailsByUsername(username)
    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body)
    res.status(StatusCodes.CREATED).json(user)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await userService.login(email, password)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  getAll,
  createNew,
  getDetails,
  getDetailsByUsername,
  register,
  login
}
