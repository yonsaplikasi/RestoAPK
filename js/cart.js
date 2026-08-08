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
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 0; color: var(--text-muted);">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Keranjang Anda Kosong</p>
        <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Silakan pilih menu makanan terlebih dahulu.</p>
        <a href="menu.html" class="btn" style="display: inline-block; width: auto; text-decoration: none;">+ Tambah Menu</a>
      </div>
    `;
    document.getElementById("checkout-total").innerText = "0";
    
    // Sembunyikan tombol checkout & batal jika keranjang kosong
    const checkoutArea = document.getElementById("checkout-action-area");
    if (checkoutArea) checkoutArea.style.display = "none";
    return;
  }

  // Tampilkan area checkout jika ada item
  const checkoutArea = document.getElementById("checkout-action-area");
  if (checkoutArea) checkoutArea.style.display = "block";

  container.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid var(--border);">
      <div style="flex: 1; padding-right: 0.5rem;">
        <strong style="font-size: 0.95rem; display: block; margin-bottom: 0.2rem;">${item.nama}</strong>
        <span style="font-size: 0.85rem; color: var(--text-muted);">@ Rp ${item.harga.toLocaleString('id-ID')}</span>
      </div>

      <!-- Kontrol Ubah Jumlah (+ / -) -->
      <div class="qty-control" style="margin-right: 0.75rem;">
        <button class="btn-qty" onclick="changeCartQty('${item.id}', -1)">-</button>
        <span class="qty-number">${item.qty}</span>
        <button class="btn-qty" onclick="changeCartQty('${item.id}', 1)">+</button>
      </div>

      <!-- Subtotal Item & Tombol Hapus -->
      <div style="text-align: right; min-width: 80px;">
        <strong style="display: block; font-size: 0.95rem; margin-bottom: 0.2rem;">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</strong>
        <button onclick="removeItem('${item.id}')" style="background: none; border: none; color: #EF4444; font-size: 0.75rem; cursor: pointer; padding: 0; font-weight: 600;">Hapus</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);
  document.getElementById("checkout-total").innerText = total.toLocaleString('id-ID');
}

// Fungsi Mengubah Jumlah (+ / -) dari Keranjang
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

// Fungsi Menghapus 1 Jenis Item dari Keranjang
function removeItem(id) {
  if (confirm("Hapus pesanan ini dari keranjang?")) {
    let cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("resto_cart", JSON.stringify(cart));
    renderCart();
  }
}

// Fungsi Membatalkan Seluruh Pesanan
function cancelAllOrders() {
  if (confirm("Apakah Anda yakin ingin membatalkan semua pesanan?")) {
    localStorage.removeItem("resto_cart");
    renderCart();
  }
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
