import express from 'express'
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get list carts.' })
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'Note: API create list carts.' })
  })

export const cartRoute = Router
