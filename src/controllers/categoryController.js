/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */
import { StatusCodes } from 'http-status-codes'
import { categorySevice } from '~/services/categoryService'

const getAll = async (req, res, next) => {
  try {
    const categories = await categorySevice.getAll()

    res.status(StatusCodes.OK).json(categories)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const createcategory = await categorySevice.createNew(req.body)

    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createcategory)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const category = await categorySevice.getDetails(categoryId)

    res.status(StatusCodes.OK).json(category)
  } catch (error) { next(error) }
}

const getDetailsBySlug = async (req, res, next) => {
  try {
    const categorySlug = req.params.slug
    const category = await categorySevice.getDetailsBySlug(categorySlug)

    res.status(StatusCodes.OK).json(category)
  } catch (error) { next(error) }
}

export const categoryController = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug
}
