const mongoose = require('mongoose')

// Schema định nghĩa cấu trúc của phòng chat
const chatRoomSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  adminId: {
    type: String,
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending'],
    default: 'active'
  },
  metadata: {
    userName: String,
    userEmail: String,
    userAvatar: String,
    adminName: String,
    adminAvatar: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Để tối ưu query, thêm index
chatRoomSchema.index({ userId: 1, adminId: 1 }, { unique: true })
chatRoomSchema.index({ status: 1, lastMessageTime: -1 })

// Định nghĩa các methods
chatRoomSchema.statics.findOrCreateRoom = async function(userId, adminId, metadata = {}) {
  let room = await this.findOne({ userId, adminId })

  if (!room) {
    room = await this.create({
      userId,
      adminId,
      metadata,
      status: 'active'
    })
  }

  return room
}

chatRoomSchema.statics.getActiveRooms = function(adminId) {
  return this.find({
    adminId,
    status: { $ne: 'closed' }
  }).sort({ lastMessageTime: -1 })
}

chatRoomSchema.statics.updateLastMessage = function(roomId, message, time = new Date()) {
  return this.findByIdAndUpdate(
    roomId,
    {
      lastMessage: message,
      lastMessageTime: time,
      updatedAt: time
    },
    { new: true }
  )
}

chatRoomSchema.statics.incrementUnreadCount = function(roomId, receiverId) {
  return this.findOneAndUpdate(
    {
      _id: roomId,
      $or: [
        { userId: receiverId },
        { adminId: receiverId }
      ]
    },
    { $inc: { unreadCount: 1 } },
    { new: true }
  )
}

chatRoomSchema.statics.resetUnreadCount = function(roomId, readerId) {
  return this.findOneAndUpdate(
    {
      _id: roomId,
      $or: [
        { userId: readerId },
        { adminId: readerId }
      ]
    },
    { unreadCount: 0 },
    { new: true }
  )
}

chatRoomSchema.statics.closeRoom = function(roomId) {
  return this.findByIdAndUpdate(
    roomId,
    { status: 'closed', updatedAt: new Date() },
    { new: true }
  )
}

// Tạo model từ schema
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)

module.exports = ChatRoom