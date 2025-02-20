/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */

import { slugify } from '~/utils/formatters'
import { categoryModel } from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const getAll = async () => {
  try {
    const categories = await categoryModel.getAll()
    return categories
  } catch (error) { throw error }
}

const createNew = async (reqBody) => {
  try {
    const newcategory = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }
    const createdcategory = await categoryModel.createNew(newcategory)
    const getNewcategory = await categoryModel.findOneById(createdcategory.insertedId.toString())

    return getNewcategory
  } catch (error) { throw error }
}

const getDetails = async (categoryId) => {
  try {
    const category = await categoryModel.findOneById(categoryId)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'category not found')

    return category
  } catch (error) { throw error }
}

const getDetailsBySlug = async (categorieslug) => {
  try {
    const category = await categoryModel.getDetailsBySlug(categorieslug)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'category not found')

    return category
  } catch (error) { throw error }
}

export const categorySevice = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug
}
