import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

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
