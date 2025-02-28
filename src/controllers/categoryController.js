/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */
import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'

const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll()
    res.status(StatusCodes.OK).json(categories)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    const createcategory = await categoryService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createcategory)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const category = await categoryService.getDetails(categoryId)
    res.status(StatusCodes.OK).json(category)
  } catch (error) { next(error) }
}

const getDetailsBySlug = async (req, res, next) => {
  try {
    const categorySlug = req.params.slug
    const category = await categoryService.getDetailsBySlug(categorySlug)
    res.status(StatusCodes.OK).json(category)
  } catch (error) { next(error) }
}

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const updateData = req.body
    const updatedCategory = await categoryService.updateCategory(categoryId, updateData)
    res.status(StatusCodes.OK).json(updatedCategory)
  } catch (error) { next(error) }
}

const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    await categoryService.deleteCategory(categoryId)
    res.status(StatusCodes.NO_CONTENT).send()
  } catch (error) { next(error) }
}

const getHierarchy = async (req, res, next) => {
  try {
    const categories = await categoryService.getHierarchy()
    res.status(StatusCodes.OK).json(categories)
  } catch (error) { next(error) }
}

export const categoryController = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug,
  updateCategory,
  deleteCategory,
  getHierarchy
}
