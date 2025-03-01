import Payment from '~/models/paymentModel'
import handleZaloPayCallback from '~/callbacks/zalopay.callback'
import handleMomoCallback from '~/callbacks/momo.callback'
import handleVNPayCallback from '~/callbacks/vnpay.callback'

const PaymentController = {
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.getAll()
      res.json(payments)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async createNewPayment(req, res) {
    try {
      const { insertedId, paymentInfo } = await Payment.createNew(req.body)
      res.status(201).json({ insertedId, paymentInfo })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async getPaymentById(req, res) {
    try {
      const payment = await Payment.findOneById(req.params.id)
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' })
      }
      res.json(payment)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async updatePaymentStatus(req, res) {
    try {
      const updated = await Payment.updateById(req.params.id, { status: req.body.status })
      if (!updated) {
        return res.status(404).json({ message: 'Payment not found' })
      }
      res.json({ message: 'Payment status updated successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async paymentCallback(req, res) {
    const { paymentGateway } = req.params

    switch (paymentGateway) {
    case 'zalopay':
      return await handleZaloPayCallback(req, res)
    case 'momo':
      return await handleMomoCallback(req, res)
    case 'vnpay':
      return await handleVNPayCallback(req, res)
    default:
      return res.status(400).json({ message: 'Invalid payment gateway' })
    }
  }
}

export default PaymentController