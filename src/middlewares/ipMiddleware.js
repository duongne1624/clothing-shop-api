import requestIp from 'request-ip'

const formatIpAddress = (req, res, next) => {
  try {
    // Lấy IP từ các header khác nhau
    const clientIp = requestIp.getClientIp(req) ||
                    req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    req.connection.socket?.remoteAddress ||
                    '127.0.0.1'
    let formattedIp = clientIp
    if (clientIp.includes('::1') || clientIp.includes('::ffff:')) {
      formattedIp = '127.0.0.1'
    }
    if (clientIp.includes(':')) {
      const ipv4 = clientIp.split(':').pop()
      if (ipv4.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
        formattedIp = ipv4
      }
    }
    req.ipAddr = formattedIp
    next()
  } catch (error) {
    req.ipAddr = '127.0.0.1'
    next()
  }
}

export default formatIpAddress
