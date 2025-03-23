import { orderModel } from '~/models/orderModel'

const createOrder = async (orderData) => {
  return await orderModel.createNew(orderData)
}

const getAllOrders = async () => {
  return await orderModel.getAll()
}

const getOrderById = async (orderId) => {
  return await orderModel.findOneById(orderId)
}

const getOrderByTranId = async (orderId) => {
  return await orderModel.findOneByAppTransId(orderId)
}

const updateOrderStatus = async (orderId) => {
  return await orderModel.updateStatus(orderId)
}

const updateById = async (orderId, updateData) => {
  return await orderModel.updateById(orderId, updateData)
}

const deleteById = async (orderId) => {
  return await orderModel.deleteById(orderId)
}

const getOrdersByUserId = async (userId) => {
  return await orderModel.getAllByUserId(userId)
}

export const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByTranId,
  updateOrderStatus,
  updateById,
  deleteById,
  getOrdersByUserId
}
