/**
 * js/features.js
 * Fokus: Pencarian (Debounce), Filter, Sorting, Pagination, dan Keranjang Belanja
 */

// ============================================================================
// 1. STANDARISASI KEY LOCAL STORAGE & STATE
// ============================================================================
const CART_KEY = 'cart_items';
let currentProducts = []; // Menyimpan data asli
let displayedProducts = []; // Menyimpan data hasil filter/sort

const appState = {
    searchQuery: '',
    categoryFilter: 'all',
    sortBy: 'default',
    limit: 10
};

// ============================================================================
// 2. KERANJANG BELANJA (LOCAL STORAGE CRUD)
// ============================================================================
function getCart() {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cartArray) {
    localStorage.setItem(CART_KEY, JSON.stringify(cartArray));
    updateCartBadgeAndTotal();
}

// Catatan: Fungsi ini harus dipanggil di catalog.js saat tombol "Tambah" diklik
window.addToCart = function(productStr) {
    // Karena product dari HTML dikirim sebagai string JSON, kita parse dulu
    let product;
    try {
        product = typeof productStr === 'string' ? JSON.parse(productStr) : productStr;
    } catch(e) {
        console.error("Gagal parse produk", e);
        return;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
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
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const badgeEl = document.getElementById('cart-badge');
    const totalEl = document.getElementById('cart-total');

    if (badgeEl) badgeEl.textContent = totalItems;
    if (totalEl) totalEl.textContent = `$${totalPrice.toFixed(2)}`;
}

// ============================================================================
// 3. FITUR PENCARIAN REAL-TIME (DEBOUNCE)
// ============================================================================
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
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

// ============================================================================
// 4. FILTER, SORTING, DAN RENDER MANUAL
// ============================================================================
function processAndRenderProducts() {
    // MENGAMBIL DATA DARI ANGGOTA 2 (Pastikan variabel ini ada di catalog.js)
    if (typeof allProducts !== 'undefined' && currentProducts.length === 0) {
        currentProducts = allProducts;
    }

    if (currentProducts.length === 0) return;

    let result = [...currentProducts];

    // Filter Pencarian
    if (appState.searchQuery) {
        result = result.filter(p => p.title.toLowerCase().includes(appState.searchQuery));
    }

    // Filter Kategori
    if (appState.categoryFilter !== 'all') {
        result = result.filter(p => p.category === appState.categoryFilter);
    }

    // Sorting
    if (appState.sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (appState.sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (appState.sortBy === 'rating-desc') result.sort((a, b) => b.rating - a.rating);

    // Pagination
    displayedProducts = result.slice(0, appState.limit);
    const hasMore = appState.limit < result.length;

    // RENDER MANUAL MENGGANTIKAN ANGGOTA 2
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
        catalogEl.innerHTML = ''; // Bersihkan elemen sebelumnya
        
        displayedProducts.forEach(p => {
            // Gunakan template literal dari chat Anggota 2
            const card = document.createElement('div');
            card.className = 'card';
            
            // Siapkan data JSON untuk dimasukkan ke fungsi keranjang
            const productData = JSON.stringify({id: p.id, title: p.title, price: p.price}).replace(/'/g, "\\'");

            card.innerHTML = `
                ${p.discountPercentage ? `<div class="badge">-${Math.round(p.discountPercentage)}%</div>` : ''}
                <div class="thumb"><img src="${p.thumbnail}" alt="${p.title}" loading="lazy"></div>
                <div class="info">
                    <span class="category">${p.category}</span>
                    <div class="name">${p.title}</div>
                    <div class="meta">
                        <span class="price">$${p.price.toFixed(2)}</span>
                        <span class="rating"><span class="star">★</span> ${p.rating}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick='addToCart(${productData})' style="margin-top:10px; width:100%; padding:8px; cursor:pointer; background:#f7b32b; border:none; font-weight:bold;">Tambah ke Keranjang</button>
                </div>
            `;
            catalogEl.appendChild(card);
        });
    }

    // Tombol Load More
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
    }
}

// ============================================================================
// 5. INISIALISASI SAAT DOM LOADED
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadgeAndTotal();

    const searchInput = document.getElementById('searchInput'); // Sesuai HTML: id="searchInput"
    const categorySelect = document.getElementById('categoryFilter'); // Sesuai HTML: id="categoryFilter"
    const sortSelect = document.getElementById('sortFilter'); // Sesuai HTML: id="sortFilter"
    const loadMoreBtn = document.getElementById('loadMoreBtn'); // Sesuai HTML: id="loadMoreBtn"

    if (searchInput) searchInput.addEventListener('input', handleSearch);
    
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            appState.categoryFilter = e.target.value;
            appState.limit = 10;
            processAndRenderProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            appState.sortBy = e.target.value;
            appState.limit = 10;
            processAndRenderProducts();
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            appState.limit += 10;
            processAndRenderProducts();
        });
    }

    // Tunggu data di-fetch oleh Anggota 2, lalu panggil proses pertama kali
    setTimeout(() => {
        processAndRenderProducts();
    }, 1000); 
});

