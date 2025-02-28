import { orderService } from '~/services/orderService'
import { createOrderSchema, updateOrderSchema } from '~/validations/orderValidation'

const createOrder = async (req, res, next) => {
  try {
    const validatedOrder = await createOrderSchema.validateAsync(req.body, { abortEarly: false })
    const newOrder = await orderService.createOrder(validatedOrder)
    res.status(201).json({ message: 'Đơn hàng đã được tạo!', order: newOrder })
  } catch (error) {
    next(error)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders()
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const validatedData = await updateOrderSchema.validateAsync(req.body, { abortEarly: false })
    const updatedOrder = await orderService.updateOrderStatus(req.params.id, validatedData.status)
    res.status(200).json({ message: 'Cập nhật trạng thái thành công!', order: updatedOrder })
  } catch (error) {
    next(error)
  }
}

const deleteOrder = async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
}
