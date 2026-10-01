const CART_KEY = "cart_items";
let currentProducts = [];
let displayedProducts = []; 

const appState = {
  searchQuery: "",
  categoryFilter: "all",
  sortBy: "default",
  limit: 10,
};
function formatPrice(n) {
  var harga = Number(n) * 17900;
  return (
    "IDR " +
    harga.toLocaleString("id-ID")
  );
}
function getCart() {
  const cartData = localStorage.getItem(CART_KEY);
  return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cartArray) {
  localStorage.setItem(CART_KEY, JSON.stringify(cartArray));
  updateCartBadgeAndTotal();
}
window.addToCart = function (productStr) {
  let product;
  try {
    product =
      typeof productStr === "string" ? JSON.parse(productStr) : productStr;
  } catch (e) {
    console.error("Gagal parse produk", e);
    return;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex > -1) {
    if(cart[existingIndex].qty >=3){
      alert("gagal karena kelebihan")
      return;
    }
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  alert(`Sukses menambahkan ${product.title} ke keranjang!`);
};

function updateCartBadgeAndTotal() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const badgeEl = document.getElementById("cart-badge");
  const totalEl = document.getElementById("cart-total");

  if (badgeEl) badgeEl.textContent = totalItems;
  if (totalEl) totalEl.textContent = `${formatPrice(totalPrice.toFixed(2))}`;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const handleSearch = debounce((e) => {
  appState.searchQuery = e.target.value.toLowerCase();
  appState.limit = 10;
  processAndRenderProducts();
}, 500);

function processAndRenderProducts() {
  if (typeof allProducts !== "undefined" && currentProducts.length === 0) {
    currentProducts = allProducts;
  }

  if (currentProducts.length === 0) return;

  let result = [...currentProducts];

  if (appState.searchQuery) {
    result = result.filter((p) =>
      p.title.toLowerCase().includes(appState.searchQuery),
    );
  }
  if (appState.categoryFilter !== "all") {
    result = result.filter((p) => p.category === appState.categoryFilter);
  }
  if (appState.sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (appState.sortBy === "price-desc")
    result.sort((a, b) => b.price - a.price);
  else if (appState.sortBy === "rating-desc")
    result.sort((a, b) => b.rating - a.rating);

  displayedProducts = result.slice(0, appState.limit);
  const hasMore = appState.limit < result.length;

  const catalogEl = document.getElementById("catalog");
  if (catalogEl) {
    catalogEl.innerHTML = ""; 

    displayedProducts.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
     const productData = JSON.stringify({
        id: p.id,
        title: p.title,
        price: p.price,
      }).replace(/'/g, "\\'");

      card.id = `product-card-${p.id}`; 
      card.dataset.id = p.id;

      card.innerHTML = `
            ${p.discountPercentage ? `<div class="badge">-${Math.round(p.discountPercentage)}%</div>` : ""}
            <div class="thumb"><img src="${p.thumbnail}" alt="${p.title}" loading="lazy"></div>
            <div class="info">
                <span class="category">${p.category}</span>
                <div class="name">${p.title}</div>
                <div class="meta">
                    <span class="price">${formatPrice(p.price.toFixed(2))}</span>
                    <span class="rating"><span class="star">★</span> ${p.rating}</span>
                </div>
                <button class="add-to-cart-btn" onclick='event.stopPropagation(); addToCart(${productData})' style="margin-top:10px; width:100%; padding:8px; cursor:pointer; background:#f7b32b; border:none; font-weight:bold;">Tambah ke Keranjang</button>
            </div>
        `;
      catalogEl.appendChild(card);
    });
  }
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMore ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadgeAndTotal();

  const searchInput = document.getElementById("searchInput"); 
  const categorySelect = document.getElementById("categoryFilter"); 
  const sortSelect = document.getElementById("sortFilter"); 
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (searchInput) searchInput.addEventListener("input", handleSearch);

  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      appState.categoryFilter = e.target.value;
      appState.limit = 10;
      processAndRenderProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      appState.sortBy = e.target.value;
      appState.limit = 10;
      processAndRenderProducts();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      appState.limit += 10;
      processAndRenderProducts();
    });
  }

  setTimeout(() => {
    processAndRenderProducts();
  }, 1000);
});
