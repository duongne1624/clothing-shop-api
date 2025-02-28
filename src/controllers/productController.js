import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

const getAll = async (req, res, next) => {
  try {
    const products = await productService.getAll()
    res.status(StatusCodes.OK).json(products)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    const createProduct = await productService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createProduct)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const productId = req.params.id
    const product = await productService.getDetails(productId)
    res.status(StatusCodes.OK).json(product)
  } catch (error) { next(error) }
}

const getDetailsBySlug = async (req, res, next) => {
  try {
    const productSlug = req.params.slug
    const product = await productService.getDetailsBySlug(productSlug)
    res.status(StatusCodes.OK).json(product)
  } catch (error) { next(error) }
}

const getAllProductByCategoryId = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId
    const products = await productService.getAllProductByCategoryId(categoryId)
    res.status(StatusCodes.OK).json(products)
  } catch (error) { next(error) }
}

const getProductsByCategorySlug = async (req, res, next) => {
  try {
    const { categorySlug } = req.params
    const products = await productService.getProductsByCategorySlug(categorySlug)
    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id
    const updatedProduct = await productService.updateProduct(productId, req.body)
    res.status(StatusCodes.OK).json(updatedProduct)
  } catch (error) { next(error) }
}

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id
    await productService.deleteProduct(productId)
    res.status(StatusCodes.OK).json({ message: 'Product deleted successfully' })
  } catch (error) { next(error) }
}

const searchProducts = async (req, res, next) => {
  try {
    const { keyWord } = req.params
    if (!keyWord) return res.status(400).json({ message: 'Keyword is required' })

    const products = await productService.searchProducts(keyWord)
    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
}

export const productController = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug,
  getAllProductByCategoryId,
  getProductsByCategorySlug,
  updateProduct,
  deleteProduct,
  searchProducts
}
