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

const getAllProductByCategoryType = async (categoryId) => {
  try {
    const products = await productModel.getAllProductByCategoryType(categoryId)
    return products
  } catch (error) { throw error }
}

const getProductsByCategorySlug = async (categorySlug) => {
  try {
    // Tìm category dựa trên slug
    const category = await categoryModel.getDetailsBySlug(categorySlug)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')

    // Lấy danh sách sản phẩm theo categoryId
    const products = await productModel.getAllProductByCategoryId(category._id.toString())
    const listCategory = {
      category: category.name,
      numberOf: products.Length,
      products: products
    }
    return listCategory
  } catch (error) {
    throw error
  }
}

const updateProduct = async (productId, updateData) => {
  try {
    const existingProduct = await productModel.findOneById(productId)
    if (!existingProduct) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')

    if (updateData.name) {
      updateData.slug = slugify(updateData.name)
    }

    const updatedProduct = await productModel.updateProduct(productId, updateData)
    return updatedProduct
  } catch (error) { throw error }
}

const deleteProduct = async (productId) => {
  try {
    const existingProduct = await productModel.findOneById(productId)
    if (!existingProduct) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')

    await productModel.deleteProduct(productId)
  } catch (error) { throw error }
}

const searchProducts = async (keyword) => {
  try {
    const products = await productModel.searchByKeyword(keyword)
    return products
  } catch (error) {
    throw error
  }
}

export const productService = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug,
  getAllProductByCategoryId,
  getAllProductByCategoryType,
  getProductsByCategorySlug,
  updateProduct,
  deleteProduct,
  searchProducts
}
