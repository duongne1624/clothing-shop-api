const mongoose = require('mongoose')

// Schema định nghĩa cấu trúc của tin nhắn chat
const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Để tối ưu query, thêm index
chatMessageSchema.index({ roomId: 1, createdAt: -1 })
chatMessageSchema.index({ sender: 1, receiver: 1 })

// Định nghĩa các methods
chatMessageSchema.statics.findMessagesByRoomId = function(roomId, limit = 50, skip = 0) {
  return this.find({ roomId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

chatMessageSchema.statics.findUnreadMessages = function(roomId, userId) {
  return this.find({
    roomId,
    receiver: userId,
    readStatus: false
  })
}

chatMessageSchema.statics.markAsRead = function(messageId) {
  return this.findByIdAndUpdate(
    messageId,
    { readStatus: true },
    { new: true }
  )
}

chatMessageSchema.statics.markAllAsRead = function(roomId, userId) {
  return this.updateMany(
    {
      roomId,
      receiver: userId,
      readStatus: false
    },
    { readStatus: true }
  )
}

// Tạo model từ schema
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

module.exports = ChatMessage