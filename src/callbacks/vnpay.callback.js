async function handleVNPayCallback(req, res) {
  // Logic xử lý callback từ VNPay
  console.log('Callback from VNPay:', req.body)
  // ... (Xử lý dữ liệu từ VNPay và cập nhật database)
  res.json({ message: 'VNPay callback received' })
}

export default handleVNPayCallback