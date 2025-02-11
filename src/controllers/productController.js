/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */
import { StatusCodes } from 'http-status-codes'
import { productSevice } from '~/services/productService'


const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)
    // console.log('req.cookies: ', req.cookies)
    // console.log('req.files: ', req.files)
    // console.log('req.jwtDecoded: ', req.jwtDecoded)

    //Điều hướng dữ liệu sang tầng Service
    const createProduct = await productSevice.createNew(req.body)

    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createProduct)
  } catch (error) { next(error) }
}

export const productController = {
  createNew
}
