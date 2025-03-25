import nodemailer from 'nodemailer'

class IObserver {
  // eslint-disable-next-line no-unused-vars
  notify(to, msg) {
    throw new Error('Chưa chọn phương thức gửi email.')
  }
}

export class SendNewCouponInformationToRegisterEmail extends IObserver {
  constructor(email) {
    super()
    this.email = email
  }

  notify(to, msg) {
    return sendEmail(to, msg)
  }
}

class ISubject {
  register() {}
  unregister() {}
  notifyRegisterUsers() {}
}

export class Subject extends ISubject {
  constructor() {
    super()
    this.observerList = []
  }

  register(observer) {
    if (!this.observerList.includes(observer)) {
      this.observerList.push(observer)
    }
  }

  unregister(observer) {
    const index = this.observerList.indexOf(observer)
    if (index !== -1) {
      this.observerList.splice(index, 1)
    }
  }

  notifyRegisterUsers(msg) {
    this.observerList.forEach(observer => {
      const to = observer.email
      observer.notify(to, msg)
    })
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

const sendEmail = async (to, msg) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Mã giảm giá mới! TDW\'s Shop',
    text: `Chào bạn! Chúng tôi rất vui mừng thông báo rằng mã giảm giá đặc biệt vừa được tạo với số lượng có hạn: ${msg}! Với mã này, bạn sẽ nhận được ưu đãi hấp dẫn khi mua sắm hoặc sử dụng dịch vụ của chúng tôi. Hãy nhanh tay áp dụng mã giảm giá tại bước thanh toán để tận hưởng ngay lợi ích tuyệt vời. Đừng bỏ lỡ cơ hội này nhé – mã có thể có thời hạn sử dụng, vì vậy hãy sử dụng sớm để không bỏ lỡ! Cảm ơn bạn đã đồng hành cùng chúng tôi!`
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Lỗi khi gửi email tới ${to}:`, error)
  }
}

export const sendVerificationEmail = async (to) => {
  var content = ''
  content += `
      <div style="padding: 10px; background-color: #003375">
          <div style="padding: 10px; background-color: white;">
              <h4 style="color: #0085ff">Chúc mừng bạn đăng ký tài khoản thành công</h4>
              <span style="color: black">Nhấn vào đây để tiếp tục mua hàng</span>
              <button style="background-color: #02db4e, color: black" href="google.com.vn">MUA HÀNG</button>
          </div>
      </div>
  `
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Đăng ký tài khoản thành công!',
    html: content
  }

  return transporter.sendMail(mailOptions)
}

export const sendConfirmationCodeEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    // eslint-disable-next-line quotes
    subject: "Mã đăng ký tài khoản! TDW's shop",
    text: `Mã xác nhận của bạn là:  ${code}`
  }

  return transporter.sendMail(mailOptions)
}

export const sendOrderConfirmationEmail = async (order, products) => {
  let itemsTable = order.items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId.toString())
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${product?.name || 'Sản phẩm không tồn tại'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.color} / ${item.size}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.price.toLocaleString()}₫</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toLocaleString()}₫</td>
      </tr>
    `
  }).join('')

  const getPaymentMethodText = (method) => {
    switch (method) {
    case 'cod': return 'Thanh toán khi nhận hàng (COD)'
    case 'momo': return 'Ví MoMo'
    case 'zalopay': return 'Ví ZaloPay'
    case 'vnpay': return 'VNPay'
    default: return method
    }
  }

  const content = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background-color: #003375; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Thông tin đơn hàng</h1>
      </div>
      
      <div style="padding: 20px; background-color: white;">
        <p>Xin chào ${order.name},</p>
        <p>Cảm ơn bạn đã đặt hàng tại TDW's Shop. Đơn hàng của bạn đã được xác nhận:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${order._id || order.id}</p>
          <p style="margin: 5px 0;"><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          <p style="margin: 5px 0;"><strong>Phương thức thanh toán:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
        </div>

        <h3>Chi tiết đơn hàng</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left;">Sản phẩm</th>
              <th style="padding: 12px; text-align: left;">Màu/Size</th>
              <th style="padding: 12px; text-align: left;">Số lượng</th>
              <th style="padding: 12px; text-align: left;">Đơn giá</th>
              <th style="padding: 12px; text-align: left;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
        </table>

        <div style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px;">
          <p style="margin: 5px 0;"><strong>Tạm tính:</strong> ${order.amount.toLocaleString()}₫</p>
          ${order.discountAmount > 0 ?
    `<p style="margin: 5px 0;"><strong>Giảm giá:</strong> -${order.discountAmount.toLocaleString()}₫</p>` :
    ''}
          <p style="margin: 5px 0; font-size: 18px; color: #003375;"><strong>Tổng cộng:</strong> ${order.lastAmount.toLocaleString()}₫</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h4 style="margin-top: 0;">Thông tin giao hàng:</h4>
          <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${order.name}</p>
          <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${order.phone}</p>
          <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${order.address}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #fff4e5; border-radius: 5px;">
          <p style="margin: 5px 0; color: #663c00;">
            <strong>Lưu ý:</strong> Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc. 
            Vui lòng chuẩn bị số tiền ${order.lastAmount.toLocaleString()}₫ khi nhận hàng.
          </p>
        </div>

        <p style="margin-top: 20px;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua:</p>
        <ul style="color: #666;">
          <li>Email: support@tdwshop.com</li>
          <li>Hotline: 1900 xxxx</li>
        </ul>
        
        <p>Trân trọng,<br>TDW's Shop</p>
      </div>
    </div>
  `

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email || order.phone + '@gmail.com',
    subject: `Thông tin đơn hàng #${order._id || order.id}`,
    html: content
  }

  return transporter.sendMail(mailOptions)
}
