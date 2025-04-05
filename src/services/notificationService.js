/* eslint-disable no-console */
/**
 * Service xử lý thông báo
 */
const socketConnection = require('../config/socket')

class NotificationService {
  constructor() {
    // Singleton check
    if (NotificationService.instance) {
      return NotificationService.instance
    }

    NotificationService.instance = this
  }

  /**
   * Gửi thông báo tin nhắn mới
   */
  async sendMessageNotification(messageData) {
    try {
      const { to, from, content, type } = messageData

      // Kiểm tra user có online không
      if (socketConnection.isUserOnline(to)) {
        // Gửi thông báo đến user qua socket
        socketConnection.sendToUser(to, 'notification:new-message', {
          from,
          preview: type === 'text' ? this.truncateMessage(content) : `[${type.toUpperCase()}]`,
          timestamp: new Date()
        })

        return true
      }

      // TODO: Nếu user không online, có thể lưu thông báo vào database để hiển thị sau
      // hoặc gửi thông báo đẩy, email, v.v.

      return false
    } catch (error) {
      console.error('Error sending message notification:', error)
      return false
    }
  }

  /**
   * Gửi thông báo yêu cầu chat mới đến admin
   */
  async sendChatRequestNotification(requestData) {
    try {
      const { userId, userName } = requestData

      // Thông báo cho tất cả admin
      socketConnection.notifyAdmins('notification:chat-request', {
        userId,
        userName: userName || userId,
        timestamp: new Date()
      })

      return true
    } catch (error) {
      console.error('Error sending chat request notification:', error)
      return false
    }
  }

  /**
   * Gửi thông báo phòng chat đóng
   */
  async sendChatClosedNotification(roomId, userId) {
    try {
      if (socketConnection.isUserOnline(userId)) {
        socketConnection.sendToUser(userId, 'notification:chat-closed', {
          roomId,
          message: 'Phiên chat này đã kết thúc.',
          timestamp: new Date()
        })

        return true
      }

      return false
    } catch (error) {
      console.error('Error sending chat closed notification:', error)
      return false
    }
  }

  /**
   * Cắt ngắn tin nhắn cho preview
   */
  truncateMessage(message, maxLength = 50) {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }
}

// Export singleton instance
const notificationService = new NotificationService()
module.exports = notificationService