import PaymentStrategy from './payment.strategy'
import axios from 'axios'
import crypto from 'crypto'
import qs from 'qs'
import dateFormat from 'dateformat'
import { env } from '~/config/environment'

class VNPayPayment extends PaymentStrategy {
  async processPayment(paymentData) {
    try {
      const config = {
        vnp_TmnCode: env.VNP_TMNCODE || 'OTJBPLCC',
        vnp_HashSecret: env.VNP_HASHSECRET || 'R24N0G0001QSNFJ8GP3CQ87TPJHTMIVZ',
        vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        vnp_ReturnUrl: `${env.CALLBACK_URL}/v1/payments/callback/vnpay`
      }

      // Thông tin đơn hàng
      const date = new Date()
      const createDate = dateFormat(date, 'yyyymmddHHmmss')
      const orderId = dateFormat(date, 'HHmmss')
      const amount = paymentData.orderDetails.totalAmount
      const orderInfo = `#${orderId}`
      const orderType = paymentData.orderDetails.orderType || '123123'
      const locale = paymentData.orderDetails.language || 'vn'
      const currCode = 'VND'
      const ipAddr = paymentData.ipAddr || '127.0.0.1'
      const expireDate = new Date(date.getTime() + 15 * 60 * 1000)
      const vnp_ExpireDate = dateFormat(expireDate, 'yyyymmddHHmmss')

      // Tạo params cho VNPay
      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Amount: amount * 100,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: vnp_ExpireDate,
        vnp_CurrCode: currCode,
        vnp_IpAddr: ipAddr,
        vnp_Locale: locale,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_TxnRef: orderId,
        vnp_ReturnUrl: config.vnp_ReturnUrl
      }


      // Nếu có bankCode thì thêm vào
      if (paymentData.orderDetails.bankCode) {
        vnp_Params['vnp_BankCode'] = paymentData.orderDetails.bankCode
      }

      // Sắp xếp params theo thứ tự alphabet
      vnp_Params = this.sortObject(vnp_Params)

      // Tạo chuỗi ký
      const signData = qs.stringify(vnp_Params, { encode: false })
      const hmac = crypto.createHmac('sha512', config.vnp_HashSecret)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

      // Thêm secure hash vào params
      vnp_Params['vnp_SecureHash'] = signed

      // Tạo URL thanh toán
      const vnpUrl = `${config.vnp_Url}?${qs.stringify(vnp_Params, { encode: false })}`

      // Trả về kết quả với URL redirect
      return {
        success: true,
        transactionId: orderId,
        paymentInfo: {
          return_code: 1,
          return_message: 'Giao dịch thành công',
          sub_return_code: 1,
          sub_return_message: 'Giao dịch thành công',
          zp_trans_token: 'AC50-D9q_7Vx5mPVvdkHfz4g',
          order_token: 'AC50-D9q_7Vx5mPVvdkHfz4g',
          order_url: vnpUrl
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  // Hàm sắp xếp object theo key
  sortObject(obj) {
    const sorted = {}
    const keys = Object.keys(obj).sort()
    keys.forEach((key) => {
      sorted[key] = obj[key]
    })
    return sorted
  }
}

export default VNPayPayment