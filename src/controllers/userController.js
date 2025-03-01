/**
 * Updated by ThaiDuowng's author on Feb 16 2025
 */

import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll()
    res.status(StatusCodes.OK).json(users)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await userService.getDetails(userId)
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại!' })
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const getDetailsByUsername = async (req, res, next) => {
  try {
    const username = req.params.username
    const user = await userService.getDetailsByUsername(username)
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Người dùng không tồn tại!' })
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
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
    const { username, password } = req.body
    const result = await userService.login(username, password)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateById(req.params.id, req.body)
    res.status(StatusCodes.OK).json({ message: 'Cập nhật thành công!', user: updatedUser })
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteById(req.params.id)
    res.status(StatusCodes.NO_CONTENT).send()
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
  login,
  updateUser,
  deleteUser
}
