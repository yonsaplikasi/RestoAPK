let cart = [];
const urlParams = new URLSearchParams(window.location.search);
const mejaParam = urlParams.get('meja');

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

  // Muat keranjang lama dari localStorage jika ada
  const savedCart = localStorage.getItem("resto_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  fetchMenu();
});

async function fetchMenu() {
  try {
    const res = await RestoAPI.getMenu();
    document.getElementById("loading").style.display = "none";
    
    if (res.success) {
      window.menuData = res.data; // Simpan data menu secara global
      renderMenu();
      updateCartUI();
    }
  } catch (err) {
    document.getElementById("loading").innerText = "Gagal memuat menu.";
  }
}

function renderMenu() {
  const container = document.getElementById("menu-container");
  
  container.innerHTML = window.menuData.map(item => {
    const cartItem = cart.find(i => i.id === item.id);
    const qty = cartItem ? cartItem.qty : 0;

    return `
      <div class="menu-card">
        <img src="${item.foto || 'https://via.placeholder.com/150'}" alt="${item.nama}">
        <h4>${item.nama}</h4>
        <p>Rp ${Number(item.harga).toLocaleString('id-ID')}</p>
        
        <div id="action-${item.id}">
          ${qty > 0 ? `
            <div class="qty-control">
              <button class="btn-qty" onclick="changeQty('${item.id}', -1)">-</button>
              <span class="qty-number">${qty}</span>
              <button class="btn-qty" onclick="changeQty('${item.id}', 1)">+</button>
            </div>
          ` : `
            <button class="btn" onclick="addToCart('${item.id}', '${item.nama}', ${item.harga})">+ Tambah</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function addToCart(id, nama, harga) {
  cart.push({ id, nama, harga, qty: 1 });
  updateCartUI();
  renderMenu();
}

function changeQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  updateCartUI();
  renderMenu();
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
