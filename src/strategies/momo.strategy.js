import PaymentStrategy from './payment.strategy'

class MomoPayment extends PaymentStrategy {
  async processPayment(paymentData, req) {
    // Logic xử lý thanh toán qua Momo
    console.log('Processing payment via Momo')
    // Giả sử Momo trả về transactionId và các thông tin khác
    const transactionId = 'momo_' + Date.now()
    const paymentInfo = {
      transactionId: transactionId
      // Thêm các thông tin khác từ Momo nếu có
    }
    return { success: true, transactionId: transactionId, paymentInfo: paymentInfo }
  }
}

export default MomoPayment