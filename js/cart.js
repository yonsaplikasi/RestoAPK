async function processCheckout() {
  const cart = JSON.parse(localStorage.getItem("resto_cart") || "[]");
  const mode = localStorage.getItem("resto_mode");
  const custName = document.getElementById("cust-name").value.trim();
  const paymentMethod = document.getElementById("payment-method") ? document.getElementById("payment-method").value : "CASH";

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

  // Sertakan informasi metode pembayaran yang dipilih pelanggan
  const payload = {
    nomorMeja: `${finalMejaInfo} - [${paymentMethod}]`,
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
