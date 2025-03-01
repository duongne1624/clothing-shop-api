import CryptoJS from 'crypto-js'
import Payment from '~/models/paymentModel'
import { orderModel } from '~/models/orderModel'


const config = {
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf'
}

async function handleZaloPayCallback(req, res) {
  let result = {}
  try {
    let dataStr = req.body.data
    let reqMac = req.body.mac
    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString()

    if (reqMac !== mac) {
      result.return_code = -1
      result.return_message = 'mac not equal'
    } else {
      let dataJson = JSON.parse(dataStr)

      await Payment.updateByAppTransId(dataJson['app_trans_id'], { status: 'success' })

      const paymentDetails = await Payment.findOneByAppTransId(dataJson['app_trans_id'])
      // Tạo đơn hàng
      await orderModel.createNew({
        userId: paymentDetails.orderDetails.userId,
        name: paymentDetails.orderDetails.name,
        phone: paymentDetails.orderDetails.phone,
        address: paymentDetails.orderDetails.address,
        items: paymentDetails.orderDetails.items,
        totalAmount: paymentDetails.orderDetails.totalAmount,
        paymentMethod: paymentDetails.paymentMethod
      })

      result.return_code = 1
      result.return_message = 'success'
    }
  } catch (ex) {
    result.return_code = 0
    result.return_message = ex.message
  }
  res.json(result)
}

export default handleZaloPayCallback