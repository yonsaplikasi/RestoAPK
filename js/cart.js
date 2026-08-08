document.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("resto_mode");
  if (mode === "UNIVERSAL_QR") {
    const tableGroup = document.getElementById("table-select-group");
    if (tableGroup) tableGroup.style.display = "block";
  }
  renderCart();
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const container = document.getElementById("cart-items");

  if (!container) return;

  // Jika keranjang kosong
  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 0; color: var(--text-muted, #64748b);">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Keranjang Anda Kosong</p>
        <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Silakan pilih menu makanan terlebih dahulu.</p>
        <a href="menu.html" class="btn" style="display: inline-block; width: auto; text-decoration: none;">+ Pilih Menu</a>
      </div>
    `;
    const totalEl = document.getElementById("checkout-total");
    if (totalEl) totalEl.innerText = "0";

    const checkoutArea = document.getElementById("checkout-action-area");
    if (checkoutArea) checkoutArea.style.display = "none";
    return;
  }

  // Tampilkan form checkout jika ada item
  const checkoutArea = document.getElementById("checkout-action-area");
  if (checkoutArea) checkoutArea.style.display = "block";

  // Render daftar item di keranjang
  container.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid var(--border, #e2e8f0);">
      <div style="flex: 1; padding-right: 0.5rem;">
        <strong style="font-size: 0.95rem; display: block; margin-bottom: 0.2rem;">${item.nama}</strong>
        <span style="font-size: 0.85rem; color: var(--text-muted, #64748b);">Rp ${Number(item.harga).toLocaleString('id-ID')}</span>
      </div>

      <!-- Tombol Pengatur Jumlah (+ / -) -->
      <div class="qty-control" style="display: flex; align-items: center; gap: 0.5rem; margin-right: 0.75rem;">
        <button class="btn-qty" onclick="changeCartQty('${item.id}', -1)" style="width:28px; height:28px; cursor:pointer;">-</button>
        <span class="qty-number" style="font-weight:bold;">${item.qty}</span>
        <button class="btn-qty" onclick="changeCartQty('${item.id}', 1)" style="width:28px; height:28px; cursor:pointer;">+</button>
      </div>

      <!-- Total Harga & Tombol Hapus -->
      <div style="text-align: right; min-width: 80px;">
        <strong style="display: block; font-size: 0.95rem; margin-bottom: 0.2rem;">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</strong>
        <button onclick="removeItem('${item.id}')" style="background: none; border: none; color: #EF4444; font-size: 0.75rem; cursor: pointer; padding: 0; font-weight: 600;">Hapus</button>
      </div>
    </div>
  `).join('');

  // Hitung Total Pembayaran
  const total = cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);
  const totalEl = document.getElementById("checkout-total");
  if (totalEl) totalEl.innerText = total.toLocaleString('id-ID');
}

// Fungsi Ubah Jumlah (+ / -)
function changeCartQty(id, change) {
  let cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const item = cart.find(i => i.id === id);

  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }

  localStorage.setItem("resto_cart", JSON.stringify(cart));
  renderCart();
}

// Fungsi Hapus 1 Item
function removeItem(id) {
  if (confirm("Hapus item ini dari keranjang?")) {
    let cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("resto_cart", JSON.stringify(cart));
    renderCart();
  }
}

// Fungsi Batal Semua Pesanan
function cancelAllOrders() {
  if (confirm("Apakah Anda yakin ingin membatalkan semua pesanan?")) {
    localStorage.removeItem("resto_cart");
    renderCart();
  }
}

// Fungsi Checkout
async function processCheckout() {
  const cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const mode = localStorage.getItem("resto_mode");
  const custNameEl = document.getElementById("cust-name");
  const custName = custNameEl ? custNameEl.value.trim() : "";
  const paymentMethodEl = document.getElementById("payment-method");
  const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "CASH";

  if (!custName) return alert("Isi nama pemesan terlebih dahulu!");
  if (cart.length === 0) return alert("Keranjang kosong!");

  let finalMejaInfo = "";
  if (mode === "FIXED_TABLE") {
    const savedMeja = localStorage.getItem("resto_meja");
    finalMejaInfo = `${savedMeja} (${custName})`;
  } else {
    const selectedTableEl = document.getElementById("cust-table");
    const selectedTable = selectedTableEl ? selectedTableEl.value : "";
    if (!selectedTable) return alert("Pilih Nomor Meja atau Tipe Pesanan!");
    finalMejaInfo = `${selectedTable} (${custName})`;
  }

  // Jika bayar tunai, beri tahu pelanggan
  if (paymentMethod === "CASH") {
    alert("Pesanan terkirim! Silakan lakukan pembayaran TUNAI di kasir.");
  } else {
    alert(`Pesanan terkirim! Metode pembayaran: ${paymentMethod}. Silakan tunjukkan bukti transfer/QRIS jika diperlukan.`);
  }

  const payload = {
    nomorMeja: finalMejaInfo,
    metodePembayaran: paymentMethod, // Dikirim ke Apps Script
    total: cart.reduce((sum, i) => sum + (i.harga * i.qty), 0),
    items: cart
  };

  const res = await RestoAPI.submitOrder(payload);

  if (res && res.success) {
    localStorage.removeItem("resto_cart");
    window.location.href = `status.html?orderId=${res.orderId}`;
  } else {
    alert("Gagal memproses pesanan: " + (res ? res.message : 'Terjadi kesalahan'));
  }
}
