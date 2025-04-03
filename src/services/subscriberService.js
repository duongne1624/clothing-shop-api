import { subscriberModel } from '~/models/subscribeModel'
const { Subject, SendNewCouponInformationToRegisterEmail } = require('~/services/emailService')

// Observer
class SubscriberService {
  constructor() {
    this.subscribers = []
    this.subject = new Subject()
  }

  async subscribe(email) {
    const existingSubscriber = this.subscribers.find(sub => sub.email === email)
    if (existingSubscriber) {
      throw new Error('Email này đã được đăng ký nhận thông báo.')
    }

    const createdSub = await subscriberModel.createNew(email)
    const getNew = await subscriberModel.findOneById(createdSub.insertedId.toString())

    this.subscribers.push(getNew)

    const observer = new SendNewCouponInformationToRegisterEmail(email)
    this.subject.register(observer)

    return getNew
  }

  async notifyAll(message) {
    this.subject.notifyRegisterUsers(message)
  }

  async unsubscribe(email) {
    const subscriberIndex = this.subscribers.findIndex(sub => sub.email === email)
    if (subscriberIndex === -1) {
      throw new Error('Email này chưa được đăng ký.')
    }

    await subscriberModel.unSubscribe(email)
    this.subscribers[subscriberIndex].isActive = false
    const observer = new SendNewCouponInformationToRegisterEmail(email)
    this.subject.unregister(observer)

    this.subscribers.splice(subscriberIndex, 1)

    return { message: 'Đã hủy đăng ký thành công.' }
  }

  async getSubscribers() {
    this.subscribers = await subscriberModel.getAll()
    this.subscribers.map(subscriber => {
      const observer = new SendNewCouponInformationToRegisterEmail(subscriber.email)
      this.subject.register(observer)
    })
    return this.subscribers
  }
}

module.exports = new SubscriberService()
