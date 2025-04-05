/* eslint-disable no-console */
/**
 * Controller xử lý các request HTTP liên quan đến chat
 */
const chatService = require('../services/chatService')
const { chatObserver } = require('../observers/chatObserver')

/**
 * Lấy lịch sử chat giữa user và admin
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params
    const adminId = req.user.id // Giả sử đã có middleware xác thực

    const chatHistory = await chatService.getChatHistory(userId, adminId)

    res.status(200).json({
      success: true,
      data: chatHistory
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tải lịch sử chat',
      error: error.message
    })
  }
}

/**
 * Lấy danh sách các phòng chat của admin
 */
exports.getAdminChatRooms = async (req, res) => {
  try {
    const adminId = req.user.id // Giả sử đã có middleware xác thực

    const chatRooms = await chatService.getAdminChatRooms(adminId)

    res.status(200).json({
      success: true,
      data: chatRooms
    })
  } catch (error) {
    console.error('Error fetching admin chat rooms:', error)
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tải danh sách phòng chat',
      error: error.message
    })
  }
}

/**
 * Gửi tin nhắn
 */
exports.sendMessage = async (req, res) => {
  try {
    const { to, message, type = 'text', metadata = {} } = req.body
    const from = req.user.id // Giả sử đã có middleware xác thực

    // Thông qua observer để xử lý logic gửi tin nhắn
    chatObserver.notify('message:new', {
      from,
      to,
      message,
      type,
      timestamp: new Date(),
      metadata
    })

    res.status(201).json({
      success: true,
      message: 'Tin nhắn đã được gửi'
    })
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi gửi tin nhắn',
      error: error.message
    })
  }
}

/**
 * Đánh dấu tin nhắn đã đọc
 */
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params
    const readerId = req.user.id // Giả sử đã có middleware xác thực

    const result = await chatService.markMessageAsRead(messageId, readerId)

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Tin nhắn đã được đánh dấu là đã đọc'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể đánh dấu tin nhắn là đã đọc'
      })
    }
  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đánh dấu tin nhắn là đã đọc',
      error: error.message
    })
  }
}

/**
 * Đánh dấu tất cả tin nhắn trong phòng đã đọc
 */
exports.markAllMessagesAsRead = async (req, res) => {
  try {
    const { roomId } = req.params
    const readerId = req.user.id // Giả sử đã có middleware xác thực

    await chatService.markAllMessagesAsRead(roomId, readerId)

    res.status(200).json({
      success: true,
      message: 'Tất cả tin nhắn đã được đánh dấu là đã đọc'
    })
  } catch (error) {
    console.error('Error marking all messages as read:', error)
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đánh dấu tất cả tin nhắn là đã đọc',
      error: error.message
    })
  }
}

/**
 * Đóng phòng chat
 */
exports.closeChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params
    const adminId = req.user.id // Giả sử đã có middleware xác thực

    // Kiểm tra quyền admin
    const isAdmin = await chatService.isAdmin(adminId)
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể đóng phòng chat'
      })
    }

    const closedRoom = await chatService.closeChatRoom(roomId)

    res.status(200).json({
      success: true,
      message: 'Phòng chat đã được đóng',
      data: closedRoom
    })
  } catch (error) {
    console.error('Error closing chat room:', error)
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đóng phòng chat',
      error: error.message
    })
  }
}