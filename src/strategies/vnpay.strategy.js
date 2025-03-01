import PaymentStrategy from './payment.strategy'

class VNPayPayment extends PaymentStrategy {
  async processPayment(paymentData) {
    // Logic xử lý thanh toán qua VNPay
    console.log('Processing payment via VNPay')
    // Giả sử VNPay trả về transactionId và các thông tin khác
    const transactionId = 'vnpay_' + Date.now()
    const paymentInfo = {
      transactionId: transactionId
      // Thêm các thông tin khác từ VNPay nếu có
    }
    return { success: true, transactionId: transactionId, paymentInfo: paymentInfo }
  }
}

export default VNPayPayment