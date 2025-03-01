import PaymentStrategy from './payment.strategy'

class CodPayment extends PaymentStrategy {
  async processPayment(paymentData) {
    console.log('Processing payment via COD')
    return { success: true, transactionId: null, paymentInfo: null }
  }
}

export default CodPayment