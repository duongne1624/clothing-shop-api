/**
 * Factory Method Pattern cho việc tạo các loại tin nhắn khác nhau
 */

// Abstract Creator
class MessageFactory {
  createMessage(roomId, sender, receiver, content, metadata = {}) {
    const message = this._createMessageObject(roomId, sender, receiver, content, metadata)
    return message
  }

  // Method to be implemented by subclasses
  _createMessageObject() {
    throw new Error('Method _createMessageObject must be implemented by subclasses')
  }
}

// Concrete Creators
class TextMessageFactory extends MessageFactory {
  _createMessageObject(roomId, sender, receiver, content, metadata = {}) {
    return {
      roomId,
      sender,
      receiver,
      content,
      messageType: 'text',
      readStatus: false,
      metadata,
      createdAt: new Date()
    }
  }
}

class ImageMessageFactory extends MessageFactory {
  _createMessageObject(roomId, sender, receiver, imageUrl, metadata = {}) {
    return {
      roomId,
      sender,
      receiver,
      content: imageUrl,
      messageType: 'image',
      readStatus: false,
      metadata: {
        ...metadata,
        width: metadata.width || 'auto',
        height: metadata.height || 'auto',
        alt: metadata.alt || 'Image'
      },
      createdAt: new Date()
    }
  }
}

class FileMessageFactory extends MessageFactory {
  _createMessageObject(roomId, sender, receiver, fileUrl, metadata = {}) {
    return {
      roomId,
      sender,
      receiver,
      content: fileUrl,
      messageType: 'file',
      readStatus: false,
      metadata: {
        ...metadata,
        fileName: metadata.fileName || 'File',
        fileSize: metadata.fileSize || 0,
        fileType: metadata.fileType || 'application/octet-stream'
      },
      createdAt: new Date()
    }
  }
}

class SystemMessageFactory extends MessageFactory {
  _createMessageObject(roomId, sender, receiver, content, metadata = {}) {
    return {
      roomId,
      sender,
      receiver,
      content,
      messageType: 'system',
      readStatus: true, // System messages are automatically read
      metadata,
      createdAt: new Date()
    }
  }
}

// Factory Provider
class MessageFactoryProvider {
  static getFactory(messageType) {
    switch (messageType) {
    case 'text':
      return new TextMessageFactory()
    case 'image':
      return new ImageMessageFactory()
    case 'file':
      return new FileMessageFactory()
    case 'system':
      return new SystemMessageFactory()
    default:
      return new TextMessageFactory() // Default to text message
    }
  }
}

module.exports = {
  MessageFactoryProvider,
  TextMessageFactory,
  ImageMessageFactory,
  FileMessageFactory,
  SystemMessageFactory
}