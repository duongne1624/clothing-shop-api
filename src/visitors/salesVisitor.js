class SalesVisitor {
  // eslint-disable-next-line no-unused-vars
  visit(order) {
    throw new Error('Phương thức visit chưa được triển khai')
  }
}

class TotalRevenueVisitor extends SalesVisitor {
  constructor() {
    super()
    this.totalRevenue = 0
  }

  visit(order) {
    this.totalRevenue += order.lastAmount
  }
}

class CategorySalesVisitor extends SalesVisitor {
  constructor(productModel) {
    super()
    this.salesByCategory = {}
    this.productModel = productModel
  }

  async visit(order) {
    for (const item of order.items) {
      const categoryId = await this.productModel.getCategoryIdByProductId(item.productId)
      if (!this.salesByCategory[categoryId]) {
        this.salesByCategory[categoryId] = 0
      }
      this.salesByCategory[categoryId] += item.quantity * item.price
    }
  }
}

class TopSellingProductsVisitor extends SalesVisitor {
  constructor(productModel) {
    super()
    this.productSales = {}
    this.productModel = productModel
  }

  visit(order) {
    order.items.forEach((item) => {
      if (!this.productSales[item.productId]) {
        this.productSales[item.productId] = 0
      }
      this.productSales[item.productId] += item.quantity
    })
  }

  async getTopSellingProducts(limit = 5) {
    const sortedProducts = Object.entries(this.productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const productsWithNames = await Promise.all(
      sortedProducts.map(async ([productId, sold]) => {
        const product = await this.productModel.findOneById(productId)
        return {
          name: product ? product.name : 'Không xác định',
          sold
        }
      })
    )

    return productsWithNames
  }
}


const filterOrdersByDate = (orders, startDate, endDate) => {
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= startDate && orderDate <= endDate
  })
}

module.exports = { TotalRevenueVisitor, CategorySalesVisitor, TopSellingProductsVisitor, filterOrdersByDate }
