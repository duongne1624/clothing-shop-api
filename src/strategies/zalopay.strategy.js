import PaymentStrategy from './payment.strategy'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import moment from 'moment'
import { env } from '~/config/environment'
import { getFinalStatus } from '~/query/zalopayQuery'

class ZaloPayPayment extends PaymentStrategy {
  async processPayment(paymentData) {
    try {
      // APP INFO
      const config = {
        app_id: 2554,
        key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
        key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
        endpoint: 'https://sb-openapi.zalopay.vn/v2/create'
      }

      const items = paymentData.items || []
      const transID = Math.floor(Math.random() * 1000000)

      let embed_data = {
        redirecturl: paymentData.redirecturl
      }

      const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
        app_user: paymentData.userId || paymentData.name,
        app_time: Date.now(),
        amount: paymentData.lastAmount,
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        description: `4TREND's Shop | Thanh toán cho đơn hàng#${transID}`,
        bank_code: 'zalopayapp',
        callback_url: `${env.CALLBACK_URL}/v1/orders/callback/zalopay`,
        name: paymentData.name,
        phone: paymentData.phone,
        address: paymentData.address
      }

      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

      const response = await axios.post(config.endpoint, order)

      if (response.data.return_code === 1) {
        const SET_TIME = 2 * 60 * 1000
        const app_trans_id = `${moment().format('YYMMDD')}_${transID}`
        console.log(app_trans_id)
        setTimeout(async () => {
          await getFinalStatus(app_trans_id)
        }, SET_TIME)
        return { success: true, transactionId: app_trans_id, paymentInfo: response.data }
      } else {
        return { success: false, message: response.data.return_message, paymentInfo: response.data }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

export default ZaloPayPayment