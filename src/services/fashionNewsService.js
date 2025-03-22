/* eslint-disable no-useless-catch */
import { fashionNewsModel } from '~/models/fashionNewsModel'
import { slugify } from '~/utils/formatters'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newNews = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createdNews = await fashionNewsModel.createNew(newNews)
    const getNewNews = await fashionNewsModel.findOneById(createdNews.insertedId.toString())

    return getNewNews
  } catch (error) { throw error }
}

const getAll = async () => {
  try {
    const news = await fashionNewsModel.getAll()
    return news
  } catch (error) { throw error }
}

const getDetails = async (newsId) => {
  try {
    const news = await fashionNewsModel.findOneById(newsId)
    if (!news) throw new ApiError(StatusCodes.NOT_FOUND, 'News not found')

    return news
  } catch (error) { throw error }
}

const getDetailsBySlug = async (newsSlug) => {
  try {
    const news = await fashionNewsModel.getDetailsBySlug(newsSlug)
    if (!news) throw new ApiError(StatusCodes.NOT_FOUND, 'News not found')

    return news
  } catch (error) { throw error }
}

const update = async (newsId, updateData) => {
  try {
    const existingNews = await fashionNewsModel.findOneById(newsId)
    if (!existingNews) throw new ApiError(StatusCodes.NOT_FOUND, 'News not found')

    if (updateData.title) {
      updateData.slug = slugify(updateData.title)
    }

    const updatedNews = await fashionNewsModel.update(newsId, {
      ...existingNews,
      ...updateData
    })

    return updatedNews
  } catch (error) { throw error }
}

const deleteNews = async (newsId) => {
  try {
    const existingNews = await fashionNewsModel.findOneById(newsId)
    if (!existingNews) throw new ApiError(StatusCodes.NOT_FOUND, 'News not found')

    await fashionNewsModel.softDelete(newsId)

    return { message: 'News deleted successfully' }
  } catch (error) { throw error }
}

export const fashionNewsService = {
  createNew,
  getAll,
  getDetails,
  getDetailsBySlug,
  update,
  deleteNews
} 