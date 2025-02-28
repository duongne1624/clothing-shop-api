/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 27 2025
 */

import { slugify } from '~/utils/formatters'
import { categoryModel } from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const getAll = async () => {
  try {
    return await categoryModel.getAll()
  } catch (error) { throw error }
}

const createNew = async (reqBody) => {
  try {
    const { parent } = reqBody

    const newCategory = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }
    const createdCategory = await categoryModel.createNew(newCategory)

    // Nếu có parent, cập nhật danh mục cha để thêm children
    if (parent) {
      await categoryModel.updateById(parent, { $push: { children: createdCategory.insertedId } })
    }

    return await categoryModel.findOneById(createdCategory.insertedId.toString())
  } catch (error) { throw error }
}

const getDetails = async (categoryId) => {
  try {
    const category = await categoryModel.findOneById(categoryId)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    return category
  } catch (error) { throw error }
}

const getDetailsBySlug = async (categorieslug) => {
  try {
    const category = await categoryModel.getDetailsBySlug(categorieslug)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    return category
  } catch (error) { throw error }
}

const updateById = async (categoryId, updateData) => {
  try {
    const category = await categoryModel.findOneById(categoryId)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')

    if (updateData.name) {
      updateData.slug = slugify(updateData.name)
      const existingCategory = await categoryModel.getDetailsBySlug(updateData.slug)
      if (existingCategory && existingCategory._id.toString() !== categoryId) {
        throw new ApiError(StatusCodes.CONFLICT, 'Category slug already exists')
      }
    }

    await categoryModel.updateById(categoryId, updateData)
    return { success: true }
  } catch (error) { throw error }
}

const deleteById = async (categoryId) => {
  try {
    const category = await categoryModel.findOneById(categoryId)
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')

    if (category.children.length > 0) {
      await Promise.all(category.children.map(async (childId) => {
        await categoryModel.updateById(childId, { parent: category.parent || null })
      }))
    }

    await categoryModel.deleteById(categoryId)
    return { success: true }
  } catch (error) { throw error }
}

const getHierarchy = async () => {
  try {
    const categories = await categoryModel.getAll()

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.id.toString()] = { ...category, children: [] }
      return acc
    }, {})

    const hierarchy = []

    categories.forEach(category => {
      const parentId = category.parent?.toString()
      if (parentId && categoryMap[parentId]) {
        categoryMap[parentId].children.push(categoryMap[category.id.toString()])
      } else {
        hierarchy.push(categoryMap[category.id.toString()])
      }
    })

    return hierarchy
  } catch (error) { throw error }
}

export const categoryService = {
  getAll,
  createNew,
  getDetails,
  getDetailsBySlug,
  updateById,
  deleteById,
  getHierarchy
}
