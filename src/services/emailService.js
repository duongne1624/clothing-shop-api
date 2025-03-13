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
      console.log('Gửi email đến người dùng: ', observer.email)
      const to = observer.email
      observer.notify(to, msg)
    })
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
