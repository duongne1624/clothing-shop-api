class PaymentStrategy {
  // eslint-disable-next-line no-unused-vars
  async processPayment(paymentData) {
    throw new Error('Method processPayment must be implemented.')
  }
}

export default PaymentStrategy