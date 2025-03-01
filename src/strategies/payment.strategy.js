class PaymentStrategy {
  async processPayment(paymentData) {
    throw new Error('Method processPayment must be implemented.')
  }
}

export default PaymentStrategy