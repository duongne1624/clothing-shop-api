/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 21 2025
 */

import { couponModel } from '~/models/couponModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
const subscriberService = require('~/services/subscriberService')

const getAll = async () => {
  try {
    const coupons = await couponModel.getAll()
    return coupons
  } catch (error) { throw error }
}

// Phương thức tạo mới một coupon
const createNew = async (reqBody) => {
  try {
    const createdCoupon = await couponModel.createNew(reqBody)
    const getNewCoupon = await couponModel.findOneById(createdCoupon.insertedId.toString())
    // Gửi thông báo đến người đăng ký
    console.log('Gửi email đến người đăng ký')
    await subscriberService.notifyAll(getNewCoupon.code)
    return getNewCoupon
  } catch (error) { throw error }
}

const getDetails = async (couponId) => {
  try {
    const coupon = await couponModel.getDetails(couponId)
    if (!coupon) throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found')
    return coupon
  } catch (error) { throw error }
}

const getCouponByCode = async (code) => {
  try {
    const coupon = await couponModel.findOneByCode(code)
    if (!coupon) throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found')

    await couponModel.incrementUsage(code)
    return coupon
  } catch (error) { throw error }
}

const validateCoupon = async (code, totalAmount) => {
  try {
    const coupon = await couponModel.findOneByCode(code)
    if (!coupon) throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid coupon code')

    if (coupon.minOrderValue && totalAmount < coupon.minOrderValue) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order value does not meet minimum requirement')
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon usage limit exceeded')
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon has expired')
    }

    return coupon
  } catch (error) { throw error }
}

const applyCoupon = async (code, totalAmount) => {
  try {
    const coupon = await validateCoupon(code, totalAmount)
    const discount = coupon.discountType === 'percentage'
      ? (totalAmount * coupon.discountValue) / 100
      : coupon.discountValue

    return {
      discount: Math.min(discount, coupon.maxDiscount || discount),
      finalAmount: totalAmount - Math.min(discount, coupon.maxDiscount || discount)
    }
  } catch (error) { throw error }
}

const updateById = async (couponId, updateData) => {
  try {
    const coupon = await couponModel.findOneById(couponId)
    if (!coupon) throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found')

    await couponModel.updateById(couponId, updateData)
    return { success: true }
  } catch (error) { throw error }
}

const deleteById = async (couponId) => {
  try {
    const coupon = await couponModel.findOneById(couponId)
    if (!coupon) throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found')

    await couponModel.deleteById(couponId)
    return { success: true }
  } catch (error) { throw error }
}

export const couponService = {
  getAll,
  createNew,
  getDetails,
  validateCoupon,
  applyCoupon,
  getCouponByCode,
  updateById,
  deleteById
}
