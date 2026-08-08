// Gantilah URL di bawah ini dengan URL Web App Apps Script Anda
const API_URL = "https://script.google.com/macros/s/AKfycbyn5CpjtdQ3B2t0ujfdP_fiSlsoSd_py98MnWZ3ay0Xkr2PCKM7rMvSvSJx6aVuwrZViw/exec";

const RestoAPI = {
  async getMenu() {
    const res = await fetch(`${API_URL}?action=getMenu`);
    return await res.json();
  },

  async submitOrder(payload) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "createOrder", data: payload })
    });
    return await res.json();
  },

  async getOrderStatus(orderId) {
    const res = await fetch(`${API_URL}?action=getOrderStatus&orderId=${orderId}`);
    return await res.json();
  },

  async getKitchenOrders() {
    const res = await fetch(`${API_URL}?action=getKitchenOrders`);
    return await res.json();
  },

  async updateStatus(orderId, status) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "updateOrderStatus", orderId: orderId, status: status })
    });
    return await res.json();
  },

  async getCashierOrders() {
    const res = await fetch(`${API_URL}?action=getCashierOrders`);
    return await res.json();
  },

  async processPayment(orderId, paymentDetails) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "processPayment", orderId: orderId, paymentDetails: paymentDetails })
    });
    return await res.json();
  }
};
