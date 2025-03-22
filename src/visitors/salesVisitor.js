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
    this.categoryCache = new Map() // Cache để lưu categoryId
  }

  async visit(order) {
    const promises = order.items.map(async (item) => {
      let categoryId = this.categoryCache.get(item.productId)
      if (!categoryId) {
        categoryId = await this.productModel.getCategoryIdByProductId(item.productId)
        this.categoryCache.set(item.productId, categoryId)
      }
      if (!this.salesByCategory[categoryId]) {
        this.salesByCategory[categoryId] = 0
      }
      this.salesByCategory[categoryId] += item.quantity * item.price
    })

    await Promise.all(promises)
  }
}

class TopSellingProductsVisitor extends SalesVisitor {
  constructor(productModel) {
    super()
    this.productSales = {}
    this.productModel = productModel
    this.productCache = new Map() // Cache để lưu thông tin sản phẩm
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
        let product = this.productCache.get(productId)
        if (!product) {
          product = await this.productModel.findOneById(productId)
          this.productCache.set(productId, product)
        }
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
  const start = new Date(startDate)
  const end = new Date(endDate)
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= start && orderDate <= end
  })
}

module.exports = { TotalRevenueVisitor, CategorySalesVisitor, TopSellingProductsVisitor, filterOrdersByDate }
