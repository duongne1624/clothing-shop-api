/**
 * Updated by ThaiDuowng's author on Feb 11 2025
 */

/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'

// Middleware xử lý lỗi tập trung trong ứng dụng Back-end NodeJS (ExpressJS)
export const errorHandlingMiddleware = (err, req, res, next) => {

  // Nếu dev không cẩn thận thiếu statusCode thì mặc định sẽ để code 500 INTERNAL_SERVER_ERROR
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  // Tạo ra một biến responseError để kiểm soát những gì muốn trả về
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  }

  if (env.BUILD_MODE !== 'dev') delete responseError.stack

  // Đoạn này có thể mở rộng nhiều về sau như ghi Error Log vào file, bắn thông báo lỗi vào group Slack, Telegram, Email...vv Hoặc có thể viết riêng Code ra một file Middleware khác tùy dự án.
  // ...
  // console.error(responseError)

  res.status(responseError.statusCode).json(responseError)
}
