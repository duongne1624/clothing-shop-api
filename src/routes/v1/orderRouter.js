import express from 'express'
import { orderController } from '~/controllers/orderController'


const router = express.Router()

router.post('/', orderController.createOrder)
router.get('/', orderController.getAllOrders)
router.get('/:id', orderController.getOrderById)
router.patch('/:id/status', orderController.updateOrderStatus)

router.post('/callback/:paymentGateway', orderController.paymentCallback)

export const orderRoute = router
