/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */

import { slugify } from '~/utils/formatters'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const getAll = async () => {
  try {
    const products = await productModel.getAll()
    return products
  } catch (error) { throw error }
}

const createNew = async (reqBody) => {
  try {
    //Xử lý dữ liệu tùy đặc thù dự án
    const newProduct = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }

    //Gọi tới tầng Model để xử lí lưu bản ghi vào trong Database
    const createdProduct = await productModel.createNew(newProduct)

    //Lấy bản ghi sau khi gọi(tùy mục đích dự án có cần bước này hay không)
    const getNewProduct = await productModel.findOneById(createdProduct.insertedId.toString())

    // Trả về từ Service luôn phải có return
    return getNewProduct
  } catch (error) { throw error }
}

const getDetails = async (productId) => {
  try {
    const product = await productModel.getDetails(productId)
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')

    return product
  } catch (error) { throw error }
}

const getDetailsBySlug = async (productSlug) => {
  try {
    const product = await productModel.getDetailsBySlug(productSlug)
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')

    return product
  } catch (error) { throw error }
}

export const productSevice = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug
}
