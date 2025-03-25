import crypto from 'crypto'
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { sendOrderConfirmationEmail } from '~/services/emailService'

const config = {
  secretKey: process.env.VNPAY_SECRET_KEY,
  tmnCode: process.env.VNPAY_TMN_CODE
}

function sortObject(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort()

  for (const key of keys) {
    if (obj[key]) {
      sorted[key] = obj[key]
    }
  }
  return sorted
}

async function handleVNPayCallback(req, res) {
  let result = {}
  try {
    const vnp_Params = { ...req.query }
    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params['vnp_Amount'] = vnp_Params['vnp_Amount'] / 100

    const sortedParams = sortObject(vnp_Params)
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const hmac = crypto.createHmac('sha512', config.secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash !== signed) {
      result.return_code = -1
      result.return_message = 'Chữ ký không hợp lệ'
    } else {
      const orderId = vnp_Params['vnp_TxnRef']
      const transactionStatus = vnp_Params['vnp_TransactionStatus']

      if (transactionStatus === '00') {
        // Cập nhật trạng thái đơn hàng
        await orderModel.updateByAppTransId(orderId, { status: 'success' })

        // Lấy thông tin đơn hàng và sản phẩm
        const order = await orderModel.findOneByAppTransId(orderId)
        const products = await productModel.getByIds(order.items.map(item => item.productId))

        // Gửi email xác nhận
        await sendOrderConfirmationEmail(order, products)

        result.return_code = 1
        result.return_message = 'Giao dịch thành công'
      } else {
        result.return_code = 0
        result.return_message = 'Giao dịch thất bại'
      }
    }
  } catch (error) {
    result.return_code = 0
    result.return_message = error.message
  }

  res.json(result)
}

export default handleVNPayCallback