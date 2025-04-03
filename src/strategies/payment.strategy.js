// Định nghĩa phương thức thanh toán chung

class PaymentStrategy {
  // eslint-disable-next-line no-unused-vars
  async processPayment(paymentData, req) {
    throw new Error('Method processPayment must be implemented.')
  }
}

export default PaymentStrategy