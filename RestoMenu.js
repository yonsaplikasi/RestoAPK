let cart = [];
let urlParams = new URLSearchParams(window.location.search);
let nomorMeja = urlParams.get('meja') || "1"; // Default Meja 1 jika URL tanpa parameter ?meja=X

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("meja-info").innerText = `Meja: ${nomorMeja}`;
  fetchMenu();
});

async function fetchMenu() {
  try {
    const res = await RestoAPI.getMenu();
    const container = document.getElementById("menu-container");
    document.getElementById("loading").style.display = "none";

    if (res.success) {
      container.innerHTML = res.data.map(item => `
        <div class="menu-card">
          <img src="${item.foto || 'https://via.placeholder.com/150'}" alt="${item.nama}">
          <h4>${item.nama}</h4>
          <p>Rp ${Number(item.harga).toLocaleString('id-ID')}</p>
          <button class="btn" onclick="addToCart('${item.id}', '${item.nama}', ${item.harga})">+ Tambah</button>
        </div>
      `).join('');
    }
  } catch (err) {
    document.getElementById("loading").innerText = "Gagal memuat menu.";
  }
}

function addToCart(id, nama, harga) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, nama, harga, qty: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);

  document.getElementById("total-qty").innerText = totalQty;
  document.getElementById("total-harga").innerText = totalPrice.toLocaleString('id-ID');
  
  document.getElementById("cart-bar").style.display = totalQty > 0 ? "flex" : "none";
  
  // Simpan state keranjang sementara
  localStorage.setItem("resto_cart", JSON.stringify(cart));
  localStorage.setItem("resto_meja", nomorMeja);
}

function goToCart() {
  window.location.href = "cart.html";
}
