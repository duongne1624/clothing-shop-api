/* eslint-disable no-useless-catch */
/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */

import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    //Xử lý dữ liệu tùy đặc thù dự án
    const newProduct = {
      ...reqBody,
      slug: slugify(reqBody.name)
    }

    // Trả về từ Service luôn phải có return
    return newProduct
  } catch (error) { throw error }
}

export const productSevice = {
  createNew
}
