const express = require('express')
const Router = express.Router()
const subscriberController = require('~/controllers/subscriberController')

Router.post('/subscribe', subscriberController.subscribe)
Router.post('/notify', subscriberController.notifyAll)
Router.post('/unsubscribe', subscriberController.unsubscribe)

export const subscriberRouter = Router
