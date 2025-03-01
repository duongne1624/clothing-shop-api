import ZaloPayPayment from '~/strategies/zalopay.strategy'
import MomoPayment from '~/strategies/momo.strategy'
import VNPayPayment from '~/strategies/vnpay.strategy'
import CodPayment from '~/strategies/cod.strategy'

export class PaymentStrategyFactory {
  static create(paymentMethod) {
    switch (paymentMethod) {
    case 'zalopay':
      return new ZaloPayPayment()
    case 'momo':
      return new MomoPayment()
    case 'vnpay':
      return new VNPayPayment()
    case 'cod':
      return new CodPayment()
    default:
      throw new Error('Invalid payment method.')
    }
  }
}