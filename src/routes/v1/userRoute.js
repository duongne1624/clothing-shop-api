import express from 'express'
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get list users.' })
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'Note: API create list users.' })
  })

export const userRoute = Router
