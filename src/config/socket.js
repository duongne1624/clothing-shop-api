/* eslint-disable no-console */
/**
 * Singleton Pattern cho kết nối Socket.IO
 */
const socketIO = require('socket.io')
const chalk = require('chalk')
const { chatObserver } = require('../observers/chatObserver')

class SocketConnection {
  constructor() {
    if (SocketConnection.instance) {
      return SocketConnection.instance
    }

    this.io = null
    this.activeUsers = new Map() // userId -> socketId
    this.adminSockets = new Set() // Lưu trữ socketId của admin
    SocketConnection.instance = this
  }

  initialize(server) {
    if (this.io) {
      return this.io
    }

    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    console.log(chalk.blue('Socket.IO initialized'))
    this.setupEventHandlers()

    return this.io
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(chalk.blue(`New client connected: ${socket.id}`))

      // Xử lý đăng nhập người dùng
      socket.on('user:login', (userData) => {
        const { userId, isAdmin } = userData

        if (userId) {
          this.activeUsers.set(userId, socket.id)
          socket.userId = userId

          if (isAdmin) {
            this.adminSockets.add(socket.id)
            socket.isAdmin = true
            console.log(chalk.magenta(`Admin logged in: ${userId}`))

            // Gửi danh sách người dùng đang online cho admin
            this.io.to(socket.id).emit('admin:user-list',
              Array.from(this.activeUsers.entries())
                .filter(([id, _]) => id !== userId)
                .map(([id, socketId]) => ({ userId: id, socketId }))
            )
          } else {
            console.log(chalk.blue(`User logged in: ${userId}`))

            // Thông báo cho admin có người dùng mới online
            this.notifyAdmins('admin:user-online', { userId, socketId: socket.id })
          }
        }
      })

      // Gửi tin nhắn
      socket.on('message:send', function(messageData) {
        const { to, message, type = 'text', metadata = {} } = messageData
        const from = socket.userId

        if (!from) {
          socket.emit('error', { message: 'You are not logged in' })
          return
        }

        // Tạo đối tượng tin nhắn
        const messageObject = {
          from,
          to,
          message,
          type,
          timestamp: new Date(),
          metadata
        }

        // Lưu tin nhắn vào database (thông qua Observer)
        chatObserver.notify('message:new', messageObject)

        // Gửi tin nhắn đến người nhận cụ thể nếu có
        const recipientSocketId = this.activeUsers.get(to)
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('message:received', messageObject)
        }

        // Nếu đây là người dùng thường gửi tin nhắn, thông báo cho tất cả admin
        if (!socket.isAdmin) {
          this.notifyAdmins('message:received', {
            ...messageObject,
            userId: from // Thêm userId để admin biết tin nhắn đến từ ai
          })
        }

        // Xác nhận gửi tin nhắn thành công
        socket.emit('message:sent', { success: true, message: messageObject })
      })

      // Bắt đầu cuộc trò chuyện với admin
      socket.on('chat:start-with-admin', () => {
        if (!socket.userId) {
          socket.emit('error', { message: 'You are not logged in' })
          return
        }

        // Thông báo cho tất cả admin về yêu cầu chat mới
        this.notifyAdmins('admin:chat-request', {
          userId: socket.userId,
          socketId: socket.id,
          timestamp: new Date()
        })

        socket.emit('chat:admin-notified', {
          success: true,
          message: 'Admin đã được thông báo và sẽ chat với bạn sớm.'
        })
      })

      // Admin chấp nhận yêu cầu chat
      socket.on('admin:accept-chat', (data) => {
        if (!socket.isAdmin) {
          socket.emit('error', { message: 'Unauthorized. Admin only.' })
          return
        }

        const { userId } = data
        const userSocketId = this.activeUsers.get(userId)

        if (userSocketId) {
          // Thông báo cho người dùng rằng admin đã chấp nhận chat
          this.io.to(userSocketId).emit('chat:admin-accepted', {
            adminId: socket.userId
          })

          // Thiết lập kênh chat giữa admin và người dùng
          socket.join(`chat:${userId}`)

          // Lấy lịch sử chat (nếu có) và gửi cho admin
          chatObserver.notify('chat:history-request', {
            userId,
            adminId: socket.userId,
            socketId: socket.id
          })
        }
      })

      // Typing indicators
      socket.on('user:typing', (data) => {
        const { to, isTyping } = data
        const recipientSocketId = this.activeUsers.get(to)

        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('user:typing', {
            userId: socket.userId,
            isTyping
          })
        }
      })

      // Xử lý ngắt kết nối
      socket.on('disconnect', () => {
        console.log(chalk.yellow(`Client disconnected: ${socket.id}`))

        if (socket.userId) {
          // Nếu là admin, xóa khỏi danh sách admin
          if (socket.isAdmin) {
            this.adminSockets.delete(socket.id)
          } else {
            // Nếu là người dùng thông thường, thông báo cho admin
            this.notifyAdmins('admin:user-offline', {
              userId: socket.userId
            })
          }

          // Xóa khỏi danh sách active users
          if (this.activeUsers.get(socket.userId) === socket.id) {
            this.activeUsers.delete(socket.userId)
          }
        }
      })
    })
  }

  notifyAdmins(event, data) {
    // Gửi thông báo đến tất cả admin đang online
    this.adminSockets.forEach(socketId => {
      this.io.to(socketId).emit(event, data)
    })
  }

  // Gửi tin nhắn riêng đến một user
  sendToUser(userId, event, data) {
    const socketId = this.activeUsers.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
      return true
    }
    return false
  }

  // Kiểm tra user có online không
  isUserOnline(userId) {
    return this.activeUsers.has(userId)
  }
}

// Export instance
const socketConnection = new SocketConnection()
module.exports = socketConnection