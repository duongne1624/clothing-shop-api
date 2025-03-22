import { orderService } from '~/services/orderService'
import { createOrderSchema } from '~/validations/orderValidation'
import handleZaloPayCallback from '~/callbacks/zalopay.callback'
import handleMomoCallback from '~/callbacks/momo.callback'
import handleVNPayCallback from '~/callbacks/vnpay.callback'

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

const getOrderByTranId = async (req, res, next) => {
  try {
    const order = await orderService.getOrderByTranId(req.params.tranId)
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrderStatus(req.params.id)
    if (updatedOrder === true)
      res.status(200).json({ message: 'Cập nhật trạng thái đơn hàng thành công!', order: updatedOrder })
    else res.status(203).json({ message: 'Không thể cập nhật đơn hàng!', order: updatedOrder })
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

const paymentCallback = async (req, res) => {
  const { paymentGateway } = req.params

  switch (paymentGateway) {
  case 'zalopay':
    return await handleZaloPayCallback(req, res)
  case 'momo':
    return await handleMomoCallback(req, res)
  case 'vnpay':
    return await handleVNPayCallback(req, res)
  default:
    return res.status(400).json({ message: 'Invalid payment gateway' })
  }
}

export const orderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByTranId,
  updateOrderStatus,
  deleteOrder,
  paymentCallback
}
