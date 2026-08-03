// Ganti dengan Deployment Web App URL dari Google Apps Script Anda
const API_URL = "https://script.google.com/macros/s/AKfycbx.../exec";

const RestoAPI = {
  // Ambil Daftar Menu
  async getMenu() {
    const response = await fetch(`${API_URL}?action=getMenu`);
    return await response.json();
  },

  // Kirim Pesanan Baru
  async submitOrder(orderPayload) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "createOrder",
        data: orderPayload
      })
    });
    return await response.json();
  },

  // Update Status Pesanan (Dapur/Kasir)
  async updateStatus(orderId, status) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "updateOrderStatus",
        orderId: orderId,
        status: status
      })
    });
    return await response.json();
  }
};
