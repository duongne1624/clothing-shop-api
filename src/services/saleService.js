import { categoryModel } from '~/models/categoryModel'
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import {
  TotalRevenueVisitor,
  CategorySalesVisitor,
  TopSellingProductsVisitor,
  filterOrdersByDate
} from '~/visitors/salesVisitor'

const calculateTotalRevenue = async (startDate, endDate) => {
  const orders = await orderModel.getAll()
  const filteredOrders = filterOrdersByDate(orders, new Date(startDate), new Date(endDate))
  const visitor = new TotalRevenueVisitor()
  filteredOrders.forEach(order => visitor.visit(order))
  return visitor.totalRevenue
}

const calculateCategorySales = async (startDate, endDate) => {
  const orders = await orderModel.getAll()
  const filteredOrders = filterOrdersByDate(orders, new Date(startDate), new Date(endDate))
  const visitor = new CategorySalesVisitor(productModel)
  for (const order of filteredOrders) {
    await visitor.visit(order)
  }

  const salesByCategoryWithNames = await replaceCategoryIdsWithNames(visitor.salesByCategory, categoryModel)

  return salesByCategoryWithNames
}

const replaceCategoryIdsWithNames = async (salesByCategory, categoryModel) => {
  const newSalesByCategory = {}

  for (const categoryId of Object.keys(salesByCategory)) {
    const categoryName = await categoryModel.GetNameById(categoryId)
    newSalesByCategory[categoryName] = salesByCategory[categoryId]
  }

  return newSalesByCategory
}


const calculateTopSellingProducts = async (startDate, endDate, limit) => {
  const orders = await orderModel.getAll()
  const filteredOrders = filterOrdersByDate(orders, new Date(startDate), new Date(endDate))
  const visitor = new TopSellingProductsVisitor(productModel)
  filteredOrders.forEach(order => visitor.visit(order))
  const TopSellingProductsVisitor1 = visitor.getTopSellingProducts(limit)
  return TopSellingProductsVisitor1
}

export const saleService = {
  calculateTotalRevenue,
  calculateCategorySales,
  calculateTopSellingProducts
}