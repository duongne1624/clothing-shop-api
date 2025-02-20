/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */

import { slugify } from '~/utils/formatters'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { categoryModel } from '~/models/categoryModel'

const getAll = async () => {
  try {
    const products = await productModel.getAll()
    return products
  } catch (error) { throw error }
}

const createNew = async (reqBody) => {
  try {
    const newProduct = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }
    const createdProduct = await productModel.createNew(newProduct)
    const getNewProduct = await productModel.findOneById(createdProduct.insertedId.toString())

    return getNewProduct
  } catch (error) { throw error }
}

const getDetails = async (productId) => {
  try {
    const product = await productModel.getDetails(productId)
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')

    // Thêm category khi tìm kiếm sản phẩm
    const category = await categoryModel.findOneById(product.categoryId)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')

    product.category = category

    return product
  } catch (error) { throw error }
}

const getDetailsBySlug = async (productSlug) => {
  try {
    const product = await productModel.getDetailsBySlug(productSlug)
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')

    // Thêm category khi tìm kiếm sản phẩm
    const category = await categoryModel.findOneById(product.categoryId)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')

    product.category = category

    return product
  } catch (error) { throw error }
}

const getAllProductByCategoryId = async (categoryId) => {
  try {
    const products = await productModel.getAllProductByCategoryId(categoryId)
    return products
  } catch (error) { throw error }
}

export const productSevice = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug,
  getAllProductByCategoryId
}
