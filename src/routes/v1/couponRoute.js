import express from 'express'
import { couponValidation } from '~/validations/couponValidation'
import { couponController } from '~/controllers/couponController'

const Router = express.Router()

Router.route('/')
  .get(couponController.getAll)
  .post(couponValidation.createNew, couponController.createNew)

Router.route('/:id')
  .get(couponController.getDetails)
  .put(couponController.updateCoupon)
  .delete(couponController.deleteCoupon)

Router.route('/GetCouponByCode/:code')
  .get(couponController.getCouponByCode)

export const couponRoute = Router
