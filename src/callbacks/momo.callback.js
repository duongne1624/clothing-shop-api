import CryptoJS from 'crypto-js'
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { sendOrderConfirmationEmail } from '~/services/emailService'

const config = {
  secretKey: process.env.MOMO_SECRET_KEY
}

async function handleMomoCallback(req, res) {
  let result = {}
  try {
    const signature = req.body.signature
    const rawSignature = `accessKey=${req.body.accessKey}&amount=${req.body.amount}&extraData=${req.body.extraData}&message=${req.body.message}&orderId=${req.body.orderId}&orderInfo=${req.body.orderInfo}&orderType=${req.body.orderType}&partnerCode=${req.body.partnerCode}&payType=${req.body.payType}&requestId=${req.body.requestId}&responseTime=${req.body.responseTime}&resultCode=${req.body.resultCode}&transId=${req.body.transId}`

    const signatureCheck = CryptoJS.HmacSHA256(rawSignature, config.secretKey).toString()

    if (signature !== signatureCheck) {
      result.return_code = -1
      result.return_message = 'Chữ ký không hợp lệ'
    } else {
      // Cập nhật trạng thái đơn hàng
      await orderModel.updateByAppTransId(req.body.orderId, { status: 'success' })

      // Lấy thông tin đơn hàng và sản phẩm
      const order = await orderModel.findOneByAppTransId(req.body.orderId)
      const products = await productModel.getByIds(order.items.map(item => item.productId))

      // Gửi email xác nhận
      await sendOrderConfirmationEmail(order, products)

      result.return_code = 1
      result.return_message = 'Giao dịch thành công'
    }
  } catch (error) {
    result.return_code = 0
    result.return_message = error.message
  }
  res.json(result)
}

export default handleMomoCallback