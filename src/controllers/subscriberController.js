const subscriberService = require('~/services/subscriberService')
const { subscribeSchema } = require('~/validations/subscriberValidation')

class SubscriberController {
  async subscribe(req, res) {
    try {
      const { error, value } = subscribeSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ message: error.details[0].message })
      }

      const subscriber = await subscriberService.subscribe(value.email)
      return res.status(201).json({
        message: 'Đăng ký nhận thông báo thành công!',
        data: subscriber
      })
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }
  }

  async notifyAll(req, res) {
    try {
      const { message } = req.body
      if (!message) {
        return res.status(400).json({ message: 'Vui lòng cung cấp nội dung thông báo.' })
      }

      await subscriberService.notifyAll(message)
      return res.status(200).json({ message: 'Thông báo đã được gửi tới tất cả người dùng!' })
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi khi gửi thông báo: ' + error.message })
    }
  }

  async unsubscribe(req, res) {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email.' })
      }

      const result = await subscriberService.unsubscribe(email)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }
  }
}

module.exports = new SubscriberController()
