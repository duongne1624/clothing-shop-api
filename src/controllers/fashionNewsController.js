import { StatusCodes } from 'http-status-codes'
import { fashionNewsService } from '~/services/fashionNewsService'

const createNew = async (req, res, next) => {
  try {
    const createdNews = await fashionNewsService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdNews)
  } catch (error) { next(error) }
}

const getAll = async (req, res, next) => {
  try {
    const news = await fashionNewsService.getAll()
    res.status(StatusCodes.OK).json(news)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const newsId = req.params.id
    const news = await fashionNewsService.getDetails(newsId)
    res.status(StatusCodes.OK).json(news)
  } catch (error) { next(error) }
}

const getDetailsBySlug = async (req, res, next) => {
  try {
    const newsSlug = req.params.slug
    const news = await fashionNewsService.getDetailsBySlug(newsSlug)
    res.status(StatusCodes.OK).json(news)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const newsId = req.params.id
    const updatedNews = await fashionNewsService.update(newsId, req.body)
    res.status(StatusCodes.OK).json(updatedNews)
  } catch (error) { next(error) }
}

const deleteNews = async (req, res, next) => {
  try {
    const newsId = req.params.id
    const result = await fashionNewsService.deleteNews(newsId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const fashionNewsController = {
  createNew,
  getAll,
  getDetails,
  getDetailsBySlug,
  update,
  deleteNews
}
