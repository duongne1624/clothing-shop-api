/* eslint-disable no-console */
/**
 * Service xử lý logic chat
 */
const ChatRoom = require('../models/chatroomModel')
const ChatMessage = require('../models/chatModel')
const { MessageFactoryProvider } = require('../factories/messageFactory')
const socketConnection = require('../config/socket')

class ChatService {
  constructor() {
    // Singleton check
    if (ChatService.instance) {
      return ChatService.instance
    }

    ChatService.instance = this
  }

  /**
   * Lưu tin nhắn vào database
   */
  async saveMessage({ from, to, message, type = 'text', timestamp = new Date(), metadata = {} }) {
    try {
      // Xác định vai trò (user hoặc admin)
      const isFromAdmin = await this.isAdmin(from)

      // Tìm hoặc tạo phòng chat
      let room

      if (isFromAdmin) {
        // Nếu tin nhắn từ admin, to sẽ là userId
        room = await this.findOrCreateChatRoom(to, from)
      } else {
        // Nếu tin nhắn từ user thường, from sẽ là userId
        // Tìm phòng chat hiện có hoặc tạo phòng chat mới với adminId chung
        room = await ChatRoom.findOne({ userId: from, status: { $ne: 'closed' } })

        if (!room) {
          // Tạo phòng mới với adminId là null (sẽ được cập nhật khi admin chấp nhận)
          room = await ChatRoom.create({
            userId: from,
            adminId: 'pending', // Giá trị tạm thời
            status: 'active', // Đặt trạng thái là active ngay từ đầu
            lastMessage: type === 'text' ? message : `[${type.toUpperCase()}]`,
            lastMessageTime: timestamp
          })
        } else if (room.status === 'pending' || room.status === 'requested') {
          // Cập nhật trạng thái phòng chat thành active nếu đang ở trạng thái chờ
          await ChatRoom.updateOne(
            { _id: room._id },
            { $set: { status: 'active' } }
          )

          room.status = 'active'
        }
      }

      // Tạo object tin nhắn bằng Factory
      const factory = MessageFactoryProvider.getFactory(type)
      const messageObject = factory.createMessage(
        room._id,
        from,
        to || 'admin', // Mặc định gửi đến 'admin' nếu không có người nhận cụ thể
        message,
        metadata
      )

      // Lưu tin nhắn vào database
      const savedMessage = await ChatMessage.create(messageObject)

      // Cập nhật thông tin phòng chat
      await ChatRoom.updateLastMessage(room._id, type === 'text' ? message : `[${type.toUpperCase()}]`, timestamp)

      // Nếu người nhận đang offline, tăng số tin nhắn chưa đọc
      if (to && !socketConnection.isUserOnline(to)) {
        await ChatRoom.incrementUnreadCount(room._id, to)
      }

      return savedMessage
    } catch (error) {
      console.error('Error saving message:', error)
      throw error
    }
  }

  /**
   * Tìm hoặc tạo phòng chat mới
   */
  async findOrCreateChatRoom(userId, adminId) {
    try {
      // Xác định xem userId có phải là admin không để đảm bảo
      // userId luôn là người dùng thông thường và adminId luôn là admin
      const isUserAdmin = await this.isAdmin(userId)
      const correctUserId = isUserAdmin ? adminId : userId
      const correctAdminId = isUserAdmin ? userId : adminId

      // Tìm phòng chat hiện có
      let room = await ChatRoom.findOne({
        userId: correctUserId,
        status: { $ne: 'closed' }
      })

      if (!room) {
        // Tạo phòng chat mới
        room = await ChatRoom.create({
          userId: correctUserId,
          adminId: correctAdminId || 'pending',
          status: 'active', // Đặt trạng thái là active ngay từ đầu
          lastMessage: '',
          lastMessageTime: new Date()
        })
      } else if (room.status === 'pending' || room.status === 'requested') {
        // Cập nhật trạng thái phòng chat
        await ChatRoom.updateOne(
          { _id: room._id },
          { $set: { status: 'active' } }
        )

        // Cập nhật object phòng chat
        room.status = 'active'
      }

      return room
    } catch (error) {
      console.error('Error finding or creating chat room:', error)
      throw error
    }
  }

  /**
   * Kiểm tra người dùng có phải là admin không
   */
  async isAdmin(userId) {
    try {
      // Giả sử có model User riêng và có field role
      // const user = await User.findById(userId);
      // return user && user.role === 'admin';

      // Hoặc sử dụng danh sách admin cứng
      const adminList = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : []
      return adminList.includes(userId)
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  /**
   * Lấy lịch sử chat
   */
  async getChatHistory(userId, adminId, limit = 30) {
    try {
      const room = await this.findOrCreateChatRoom(userId, adminId)

      const messages = await ChatMessage.findMessagesByRoomId(room._id, limit)

      // Reset unread count
      await ChatRoom.resetUnreadCount(room._id, adminId)

      return {
        roomId: room._id,
        messages: messages.reverse() // Đảo ngược để tin nhắn cũ nhất ở đầu
      }
    } catch (error) {
      console.error('Error getting chat history:', error)
      throw error
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markMessageAsRead(messageId, readerId) {
    try {
      const message = await ChatMessage.findById(messageId)

      if (message && message.receiver === readerId && !message.readStatus) {
        await ChatMessage.markAsRead(messageId)
        return true
      }

      return false
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  /**
   * Đánh dấu tất cả tin nhắn trong phòng đã đọc
   */
  async markAllMessagesAsRead(roomId, readerId) {
    try {
      await ChatMessage.markAllAsRead(roomId, readerId)
      await ChatRoom.resetUnreadCount(roomId, readerId)
      return true
    } catch (error) {
      console.error('Error marking all messages as read:', error)
      throw error
    }
  }

  /**
   * Lấy danh sách các phòng chat của một admin
   */
  async getAdminChatRooms(adminId) {
    try {
      const rooms = await ChatRoom.getActiveRooms(adminId)
      return rooms
    } catch (error) {
      console.error('Error getting admin chat rooms:', error)
      throw error
    }
  }

  /**
   * Đóng phòng chat
   */
  async closeChatRoom(roomId) {
    try {
      const room = await ChatRoom.closeRoom(roomId)

      // Tạo tin nhắn hệ thống thông báo phòng chat đã đóng
      const factory = MessageFactoryProvider.getFactory('system')
      const systemMessage = factory.createMessage(
        roomId,
        'system',
        room.userId,
        'Phiên chat này đã kết thúc.'
      )

      await ChatMessage.create(systemMessage)

      return room
    } catch (error) {
      console.error('Error closing chat room:', error)
      throw error
    }
  }
}

// Export singleton instance
const chatService = new ChatService()
module.exports = chatService