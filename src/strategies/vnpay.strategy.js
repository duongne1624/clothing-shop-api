// Phương thức thanh toán VNPAY

import PaymentStrategy from './payment.strategy'
import crypto from 'crypto'
import qs from 'qs'
import dateFormat from 'dateformat'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

class VNPayPayment extends PaymentStrategy {
  constructor() {
    super()
    // Kiểm tra các biến môi trường bắt buộc
    if (!env.VNP_TMNCODE || !env.VNP_HASHSECRET) {
      throw new Error('Thiếu thông tin cấu hình VNPay. Vui lòng kiểm tra biến môi trường.')
    }

    this.config = {
      vnp_TmnCode: env.VNP_TMNCODE,
      vnp_HashSecret: env.VNP_HASHSECRET,
      vnp_Url: env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      vnp_ReturnUrl: `${env.CALLBACK_URL}/v1/payments/callback/vnpay`
    }
  }

  async processPayment(paymentData, req) {
    try {
      // Kiểm tra lại config trước khi xử lý
      if (!this.config.vnp_HashSecret) {
        throw new ApiError(500, 'Thiếu cấu hình VNPay HashSecret')
      }

      // Validate input data
      if (!paymentData?.lastAmount) {
        throw new ApiError(400, 'Thiếu thông tin thanh toán')
      }

      // Tạo thông tin đơn hàng
      const date = new Date()
      const createDate = dateFormat(date, 'yyyymmddHHmmss')
      const orderId = dateFormat(date, 'HHmmss')
      const expireDate = new Date(date.getTime() + 15 * 60 * 1000)

      // Tạo params cho VNPay
      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.config.vnp_TmnCode,
        vnp_Amount: Math.round(paymentData.lastAmount * 100),
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: req?.ipAddr || '127.0.0.1',
        vnp_Locale: 'vn',
        vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: this.config.vnp_ReturnUrl,
        vnp_TxnRef: orderId,
        vnp_ExpireDate: dateFormat(expireDate, 'yyyymmddHHmmss')
      }

      // Thêm bankCode nếu có
      if (paymentData.bankCode) {
        vnp_Params['vnp_BankCode'] = paymentData.bankCode
      }

      // Sắp xếp params và tạo chữ ký
      vnp_Params = this.sortObject(vnp_Params)
      const signData = qs.stringify(vnp_Params, { encode: false })
      const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
      vnp_Params['vnp_SecureHash'] = signed

      // Tạo URL thanh toán
      const vnpUrl = `${this.config.vnp_Url}?${qs.stringify(vnp_Params, { encode: false })}`

      return {
        success: true,
        transactionId: orderId,
        paymentInfo: {
          return_code: 1,
          return_message: 'Khởi tạo giao dịch thành công',
          sub_return_code: 1,
          sub_return_message: 'Khởi tạo giao dịch thành công',
          order_url: vnpUrl,
          order_token: orderId
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi xử lý thanh toán VNPay',
        paymentInfo: {
          return_code: 0,
          return_message: error.message || 'Lỗi khi xử lý thanh toán VNPay'
        }
      }
    }
  }

  // Hàm sắp xếp object theo key
  sortObject(obj) {
    const sorted = {}
    const keys = Object.keys(obj).sort()
    keys.forEach((key) => {
      if (obj[key]) {
        sorted[key] = obj[key]
      }
    })
    return sorted
  }

  // Hàm xác thực callback từ VNPay
  async verifyCallback(query) {
    try {
      const vnp_Params = { ...query }
      const secureHash = vnp_Params['vnp_SecureHash']

      delete vnp_Params['vnp_SecureHash']
      delete vnp_Params['vnp_SecureHashType']

      // Sắp xếp params
      const sortedParams = this.sortObject(vnp_Params)
      const signData = qs.stringify(sortedParams, { encode: false })
      const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

      // Kiểm tra chữ ký
      if (secureHash !== signed) {
        throw new ApiError(400, 'Chữ ký không hợp lệ')
      }

      // Kiểm tra trạng thái giao dịch
      const responseCode = vnp_Params['vnp_ResponseCode']
      const transactionStatus = vnp_Params['vnp_TransactionStatus']

      return {
        success: responseCode === '00' && transactionStatus === '00',
        orderId: vnp_Params['vnp_TxnRef'],
        amount: parseInt(vnp_Params['vnp_Amount']) / 100,
        bankCode: vnp_Params['vnp_BankCode'],
        bankTranNo: vnp_Params['vnp_BankTranNo'],
        cardType: vnp_Params['vnp_CardType'],
        payDate: vnp_Params['vnp_PayDate'],
        orderInfo: vnp_Params['vnp_OrderInfo'],
        transactionNo: vnp_Params['vnp_TransactionNo'],
        responseCode: responseCode,
        message: this.getResponseMessage(responseCode)
      }
    } catch (error) {
      throw new ApiError(400, error.message || 'Lỗi khi xác thực callback VNPay')
    }
  }

  // Hàm lấy message từ response code
  getResponseMessage(responseCode) {
    const messageMap = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác'
    }
    return messageMap[responseCode] || 'Lỗi không xác định'
  }
}

export default VNPayPayment