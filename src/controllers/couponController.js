/**
 * Updated by ThaiDuowng's author on Feb 21 2025
 */
import { StatusCodes } from 'http-status-codes'
import { couponService } from '~/services/couponService'

const getAll = async (req, res, next) => {
  try {
    const coupons = await couponService.getAll()
    res.status(StatusCodes.OK).json(coupons)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    const newCoupon = await couponService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(newCoupon)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const couponId = req.params.id
    const coupon = await couponService.getDetails(couponId)
    res.status(StatusCodes.OK).json(coupon)
  } catch (error) { next(error) }
}

const validateCoupon = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body
    const validationResult = await couponService.validateCoupon(code, totalAmount)
    res.status(StatusCodes.OK).json(validationResult)
  } catch (error) { next(error) }
}

const applyCoupon = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body
    const discount = await couponService.applyCoupon(code, totalAmount)
    res.status(StatusCodes.OK).json({ discount })
  } catch (error) { next(error) }
}

const getCouponByCode = async (req, res, next) => {
  try {
    const code = req.params.code
    const coupon = await couponService.getCouponByCode(code)
    res.status(StatusCodes.OK).json({ coupon })
  } catch (error) { next(error) }
}

const updateCoupon = async (req, res, next) => {
  try {
    const couponId = req.params.id
    const updatedCoupon = await couponService.updateById(couponId, req.body)
    res.status(StatusCodes.OK).json(updatedCoupon)
  } catch (error) { next(error) }
}

const deleteCoupon = async (req, res, next) => {
  try {
    const couponId = req.params.id
    await couponService.deleteById(couponId)
    res.status(StatusCodes.NO_CONTENT).send()
  } catch (error) { next(error) }
}

export const couponController = {
  getAll,
  createNew,
  getDetails,
  validateCoupon,
  applyCoupon,
  getCouponByCode,
  updateCoupon,
  deleteCoupon
}
