import { categoryModel } from '~/models/categoryModel'
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import {
  TotalRevenueVisitor,
  CategorySalesVisitor,
  TopSellingProductsVisitor,
  filterOrdersByDate
} from '~/visitors/salesVisitor'

const statsCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000

const getCacheKey = (type, startDate, endDate) => {
  return `${type}-${startDate}-${endDate}`
}

const getCachedData = (key) => {
  const cached = statsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedData = (key, data) => {
  statsCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

const calculateTotalRevenue = async (startDate, endDate) => {
  const cacheKey = getCacheKey('revenue', startDate, endDate)
  const cachedData = getCachedData(cacheKey)
  if (cachedData) return cachedData

  const orders = await orderModel.getAll()
  const filteredOrders = filterOrdersByDate(orders, startDate, endDate)
  const visitor = new TotalRevenueVisitor()
  filteredOrders.forEach(order => visitor.visit(order))

  setCachedData(cacheKey, visitor.totalRevenue)
  return visitor.totalRevenue
}

const calculateCategorySales = async (startDate, endDate) => {
  const cacheKey = getCacheKey('category', startDate, endDate)
  const cachedData = getCachedData(cacheKey)
  if (cachedData) return cachedData

  const orders = await orderModel.getAll()
  const filteredOrders = filterOrdersByDate(orders, startDate, endDate)
  const visitor = new CategorySalesVisitor(productModel)

  await Promise.all(filteredOrders.map(order => visitor.visit(order)))
  const salesByCategoryWithNames = await replaceCategoryIdsWithNames(visitor.salesByCategory, categoryModel)

  setCachedData(cacheKey, salesByCategoryWithNames)
  return salesByCategoryWithNames
}

const replaceCategoryIdsWithNames = async (salesByCategory, categoryModel) => {
  const newSalesByCategory = {}
  const promises = Object.entries(salesByCategory).map(async ([categoryId, sales]) => {
    const categoryName = await categoryModel.GetNameById(categoryId)
    newSalesByCategory[categoryName] = sales
  })

  await Promise.all(promises)
  return newSalesByCategory
}

const calculateTopSellingProducts = async (startDate, endDate, limit = 5) => {
  const cacheKey = getCacheKey('top-products', startDate, endDate)
  const cachedData = getCachedData(cacheKey)
  if (cachedData) return cachedData

  const orders = await orderModel.getAll()
  const filteredOrders = filterOrdersByDate(orders, startDate, endDate)
  const visitor = new TopSellingProductsVisitor(productModel)

  filteredOrders.forEach(order => visitor.visit(order))
  const topProducts = await visitor.getTopSellingProducts(limit)

  setCachedData(cacheKey, topProducts)
  return topProducts
}

const clearStatsCache = () => {
  statsCache.clear()
}

export const saleService = {
  calculateTotalRevenue,
  calculateCategorySales,
  calculateTopSellingProducts,
  clearStatsCache
}