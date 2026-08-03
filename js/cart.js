document.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("resto_mode");
  if (mode === "UNIVERSAL_QR") {
    document.getElementById("table-select-group").style.display = "block";
  }
  renderCart();
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const container = document.getElementById("cart-items");

  if (cart.length === 0) {
    container.innerHTML = "<p>Keranjang kosong.</p>";
    document.getElementById("checkout-total").innerText = "0";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
      <div>
        <strong>${item.nama}</strong><br>
        <small>Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty}</small>
      </div>
      <div><strong>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</strong></div>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);
  document.getElementById("checkout-total").innerText = total.toLocaleString('id-ID');
}

async function processCheckout() {
  const cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const mode = localStorage.getItem("resto_mode");
  const custName = document.getElementById("cust-name").value.trim();

  if (!custName) return alert("Isi nama pemesan terlebih dahulu!");
  if (cart.length === 0) return alert("Keranjang kosong!");

  let finalMejaInfo = "";
  if (mode === "FIXED_TABLE") {
    const savedMeja = localStorage.getItem("resto_meja");
    finalMejaInfo = `${savedMeja} (${custName})`;
  } else {
    const selectedTable = document.getElementById("cust-table").value;
    if (!selectedTable) return alert("Pilih Nomor Meja atau Tipe Pesanan!");
    finalMejaInfo = `${selectedTable} (${custName})`;
  }

  const payload = {
    nomorMeja: finalMejaInfo,
    total: cart.reduce((sum, i) => sum + (i.harga * i.qty), 0),
    items: cart
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
