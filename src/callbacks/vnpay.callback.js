import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { sendOrderConfirmationEmail } from '~/services/emailService'

async function handleVNPayCallback(req, res) {
  let result = {}
  try {
    const vnp_Params = req.body

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params['vnp_Amount'] = vnp_Params['vnp_Amount'] / 100
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
  } catch (error) {
    result.return_code = 0
    result.return_message = error.message
  }

  res.json(result)
}

export default handleVNPayCallback