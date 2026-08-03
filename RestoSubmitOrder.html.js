// Penggalan fungsi checkout pada js/cart.js
async function processCheckout() {
  const savedCart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const savedMeja = localStorage.getItem("resto_meja") || "1";

  if (savedCart.length === 0) return alert("Keranjang kosong!");

  const payload = {
    nomorMeja: savedMeja,
    total: savedCart.reduce((sum, i) => sum + (i.harga * i.qty), 0),
    items: savedCart
  };

  alert("Mengirim pesanan...");
  const res = await RestoAPI.submitOrder(payload);

  if (res.success) {
    localStorage.removeItem("resto_cart");
    window.location.href = `status.html?orderId=${res.orderId}`;
  } else {
    alert("Gagal memproses pesanan: " + res.message);
  }
}
