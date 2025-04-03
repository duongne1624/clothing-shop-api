import ApiError from '~/utils/ApiError'
import { productModel } from '~/models/productModel'

class OrderValidator {
  constructor() {
    this.nextValidator = null
  }

  setNext(validator) {
    this.nextValidator = validator
    return validator
  }

  async validate(order) {
    if (this.nextValidator) {
      return await this.nextValidator.validate(order)
    }
    return true
  }
}

class StockValidator extends OrderValidator {
  async validate(order) {
    for (const item of order.items) {
      const product = await productModel.findOneById(item.productId)
      if (!product || product.stock < item.quantity) {
        throw new ApiError(400, 'Sản phẩm không đủ số lượng trong kho')
      }
    }
    return super.validate(order)
  }
}

class PriceValidator extends OrderValidator {
  async validate(order) {
    const calculatedAmount = order.items.reduce((total, item) => total + item.price * item.quantity, 0)
    if (calculatedAmount !== order.amount) {
      throw new ApiError(400, 'Tổng tiền không hợp lệ')
    }
    return super.validate(order)
  }
}

export const createOrderValidator = () => {
  const stockValidator = new StockValidator()
  const priceValidator = new PriceValidator()

  stockValidator.setNext(priceValidator)
  return stockValidator
}