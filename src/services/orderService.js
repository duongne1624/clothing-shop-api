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

const updateOrderStatus = async (orderId, status) => {
  return await orderModel.updateStatus(orderId, status)
}

const updateById = async (orderId, updateData) => {
  return await orderModel.updateById(orderId, updateData)
}

const deleteById = async (orderId) => {
  return await orderModel.deleteById(orderId)
}

export const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateById,
  deleteById
}
