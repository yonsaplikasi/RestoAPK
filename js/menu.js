let cart = [];
const urlParams = new URLSearchParams(window.location.search);
const mejaParam = urlParams.get('Meja');

document.addEventListener("DOMContentLoaded", () => {
  const mejaInfoEl = document.getElementById("meja-info");

  if (mejaParam) {
    localStorage.setItem("resto_mode", "FIXED_TABLE");
    localStorage.setItem("resto_meja", `Meja ${mejaParam}`);
    mejaInfoEl.innerText = `Meja Nomor: ${mejaParam}`;
  } else {
    localStorage.setItem("resto_mode", "UNIVERSAL_QR");
    localStorage.removeItem("resto_meja");
    mejaInfoEl.innerText = "QR Umum (Resto)";
  }

  fetchMenu();
});

async function fetchMenu() {
  try {
    const res = await RestoAPI.getMenu();
    document.getElementById("loading").style.display = "none";
    const container = document.getElementById("menu-container");

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
  
  localStorage.setItem("resto_cart", JSON.stringify(cart));
}

function goToCart() {
  window.location.href = "cart.html";
}
