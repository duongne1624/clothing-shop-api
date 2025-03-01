async function handleMomoCallback(req, res) {
  // Logic xử lý callback từ Momo
  console.log('Callback from Momo:', req.body)
  // ... (Xử lý dữ liệu từ Momo và cập nhật database)
  res.json({ message: 'Momo callback received' })
}

export default handleMomoCallback