/* eslint-disable no-console */
/**
 * Observer Pattern cho hệ thống Chat
 */

// Subject (Observable)
class ChatSubject {
  constructor() {
    this.observers = new Map() // event -> [callbacks]
  }

  subscribe(event, observer) {
    if (!this.observers.has(event)) {
      this.observers.set(event, [])
    }
    this.observers.get(event).push(observer)

    return () => {
      // Unsubscribe function
      const observers = this.observers.get(event)
      if (observers) {
        const index = observers.indexOf(observer)
        if (index !== -1) {
          observers.splice(index, 1)
        }
      }
    }
  }

  unsubscribe(event, observer) {
    if (!this.observers.has(event)) return false

    const observers = this.observers.get(event)
    const index = observers.indexOf(observer)

    if (index !== -1) {
      observers.splice(index, 1)
      return true
    }

    return false
  }

  notify(event, data) {
    if (!this.observers.has(event)) return

    for (const observer of this.observers.get(event)) {
      observer(data)
    }
  }
}

// Singleton instance
const chatObserver = new ChatSubject()

// Các loại observer cụ thể
class ChatMessageObserver {
  constructor(chatService) {
    this.chatService = chatService

    // Đăng ký các hàm xử lý cho các sự kiện
    chatObserver.subscribe('message:new', this.handleNewMessage.bind(this))
    chatObserver.subscribe('chat:history-request', this.handleHistoryRequest.bind(this))
    chatObserver.subscribe('message:read', this.handleMessageRead.bind(this))
  }

  async handleNewMessage(messageData) {
    try {
      // Lưu tin nhắn vào database
      await this.chatService.saveMessage(messageData)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  async handleHistoryRequest({ userId, adminId, socketId }) {
    try {
      // Lấy lịch sử chat
      const history = await this.chatService.getChatHistory(userId, adminId)

      // Thông báo lịch sử chat cho socket cụ thể
      const socketConnection = require('../config/socket')
      socketConnection.io.to(socketId).emit('chat:history', { history })
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  async handleMessageRead({ messageId, readerId }) {
    try {
      // Đánh dấu tin nhắn đã đọc
      await this.chatService.markMessageAsRead(messageId, readerId)
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }
}

class ChatNotificationObserver {
  constructor(notificationService) {
    this.notificationService = notificationService

    // Đăng ký các hàm xử lý cho các sự kiện
    chatObserver.subscribe('message:new', this.handleNewMessage.bind(this))
    chatObserver.subscribe('chat:request', this.handleChatRequest.bind(this))
  }

  async handleNewMessage(messageData) {
    try {
      // Gửi thông báo cho người nhận
      await this.notificationService.sendMessageNotification(messageData)
    } catch (error) {
      console.error('Error sending message notification:', error)
    }
  }

  async handleChatRequest(requestData) {
    try {
      // Gửi thông báo cho admin về yêu cầu chat mới
      await this.notificationService.sendChatRequestNotification(requestData)
    } catch (error) {
      console.error('Error sending chat request notification:', error)
    }
  }
}

// Export the singleton instance
module.exports = {
  chatObserver,
  ChatMessageObserver,
  ChatNotificationObserver
}