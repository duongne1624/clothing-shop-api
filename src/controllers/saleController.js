import { saleService } from '~/services/saleService'

const getTotalRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const totalRevenue = await saleService.calculateTotalRevenue(startDate, endDate)
    res.json({ totalRevenue })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getCategorySales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const salesByCategory = await saleService.calculateCategorySales(startDate, endDate)
    res.json({ salesByCategory })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTopSellingProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query
    const topProducts = await saleService.calculateTopSellingProducts(startDate, endDate, parseInt(limit))
    res.json({ topProducts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const saleController = {
  getTotalRevenue,
  getCategorySales,
  getTopSellingProducts
}