// Node v10.15.3
const axios = require('axios').default
const CryptoJS = require('crypto-js')
const qs = require('qs')
import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { sendOrderConfirmationEmail } from '~/services/emailService'

export const getFinalStatus = async (app_trans_id) => {
  let postData = {
    app_id: config.app_id,
    app_trans_id: app_trans_id
  }

  let data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

  let postConfig = {
    method: 'post',
    url: config.endpoint,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify(postData)
  }

  const response = await axios(postConfig)

  if (response.data.return_code === 1) {
    await orderModel.updateByAppTransId(app_trans_id, { status: 'success' })
    // const order = await orderModel.findOneByAppTransId(app_trans_id)
    // let products = []
    // await Promise.all(order.items.map(async item => {
    //   const product = await productModel.findOneById(item.productId)
    //   products.push(product)
    // }))
    // await sendOrderConfirmationEmail(order._id, products)
    return { message: 'success' }
  } else {
    await orderModel.updateByAppTransId(app_trans_id, { status: 'failed' })
    return { message: 'failed' }
  }
}

const config = {
  app_id: 2554,
  key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/query'
}
