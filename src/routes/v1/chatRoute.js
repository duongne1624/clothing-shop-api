/**
 * Route xử lý API cho hệ thống chat
 */
const express = require('express')
const router = express.Router()
const chatController = require('~/controllers/chatController')

// Middleware giả định xác thực người dùng
const authMiddleware = (req, res, next) => {
  // Trong thực tế, middleware này sẽ xác thực JWT hoặc session
  // Ở đây chỉ giả định người dùng đã xác thực
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Không có token xác thực'
    })
  }

  try {
    // Giả định xử lý token và lấy thông tin user
    // const token = authHeader.split(' ')[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Với mục đích demo, chúng ta sẽ hardcode thông tin user
    req.user = {
      id: 'user123',
      role: 'user'
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    })
  }
}

// Middleware kiểm tra quyền admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: 'Quyền truy cập bị từ chối'
    })
  }
}

// API lấy lịch sử chat (chỉ cho admin)
router.get('/history/:userId', authMiddleware, adminMiddleware, chatController.getChatHistory)

// API lấy danh sách phòng chat (chỉ cho admin)
router.get('/rooms', authMiddleware, adminMiddleware, chatController.getAdminChatRooms)

// API gửi tin nhắn
router.post('/message', authMiddleware, chatController.sendMessage)

// API đánh dấu tin nhắn đã đọc
router.put('/message/:messageId/read', authMiddleware, chatController.markMessageAsRead)

// API đánh dấu tất cả tin nhắn trong phòng đã đọc
router.put('/room/:roomId/read-all', authMiddleware, chatController.markAllMessagesAsRead)

// API đóng phòng chat (chỉ cho admin)
router.put('/room/:roomId/close', authMiddleware, adminMiddleware, chatController.closeChatRoom)

module.exports = router