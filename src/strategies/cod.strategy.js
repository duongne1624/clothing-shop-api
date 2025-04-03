// Phương thức thanh toán COD

import PaymentStrategy from './payment.strategy'

class CodPayment extends PaymentStrategy {
  async processPayment(paymentData, req) {
    return { success: true, transactionId: null, paymentInfo: {
      return_code: 1,
      return_message: 'Giao dịch thành công',
      sub_return_code: 1,
      sub_return_message: 'Giao dịch thành công',
      zp_trans_token: 'ACiGwotsTyXAh9nnzMj-Rdow',
      order_url: paymentData.redirecturl,
      order_token: 'ACiGwotsTyXAh9nnzMj-Rdow'
    } }
  }
}

export default CodPayment