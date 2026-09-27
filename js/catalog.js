    const DummyJSON = "https://dummyjson.com/products";
    const batasLoad = 10;

    let allProducts = [];
    let visibleCount = 0;

    const catalogEl = document.getElementById("catalog");
    const statusEl = document.getElementById("status");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    const modalImg = document.getElementById("modalImg");
    const modalBody = document.getElementById("modalBody");

    function formatPrice(n) {
      var harga = Number(n) * 17900;
      return "IDR " + harga.toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function skeletonCards(n) {
      catalogEl.innerHTML = "";
      for (let i = 0; i < n; i++) {
        const el = document.createElement("div");
        el.className = "card skeleton";
        el.innerHTML = `
        <div class="thumb"></div>
        <div class="info">
          <div class="name">Memuat nama produk yang cukup panjang</div>
          <div class="price">$00.00</div>
        </div>`;
        catalogEl.appendChild(el);
      }
    }
    async function loadProducts() {
      skeletonCards(10);
      try {
        const res = await fetch(DummyJSON);
        if (!res.ok) throw new Error("Gagal memuat data (status " + res.status + ")");
        const data = await res.json();
        allProducts = data.products || [];
        visibleCount = 0;
      } catch (err) {
        statusEl.textContent = "Terjadi kesalahan saat memuat produk: " + err.message;
        catalogEl.innerHTML = "";
      }
    }
    
    catalogEl.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const product = allProducts.find(p => String(p.id) === card.dataset.id);
      if (product) openModal(product);
    });
    function openModal(p) {
      modalImg.src = p.thumbnail;
      modalImg.alt = p.title;
      modalBody.innerHTML = `
      <span class="category">${p.category}</span>
      <h2>${p.title}</h2>
      <div class="brand">${p.brand ? "Brand: " + p.brand : ""}</div>
      <div class="price-row">
        <span class="price">${formatPrice(p.price)}</span>
        ${p.discountPercentage ? `<span class="discount-tag">-${Math.round(p.discountPercentage)}%</span>` : ""}
      </div>
      <p class="desc">${p.description || ""}</p>
      <div class="modal-stats">
        <div><span>Stok</span>${p.stock ?? "-"} unit</div>
        <div><span>Rating</span>★ ${p.rating ?? "-"}</div>
        <div><span>Kategori</span>${p.category}</div>
        <div><span>SKU</span>${p.sku ?? "-"}</div>
      </div>
    `;
      modalOverlay.classList.add("open");
    }

    function closeModal() {
      modalOverlay.classList.remove("open");
    }

    document.getElementById("modalClose").addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    loadProducts();