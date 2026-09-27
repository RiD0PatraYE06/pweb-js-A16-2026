// ==========================================
// ANGGOTA 1: LOGIN, AUTH GUARD & SESSION LOGIC
// ==========================================

const USERS_API_URL = "https://dummyjson.com/users";

// Inisialisasi Event Listener setelah DOM Siap
document.addEventListener("DOMContentLoaded", () => {
  const isLoginPage = window.location.pathname.endsWith("login.html");

  if (isLoginPage) {
    // 1. Jika pengguna sudah login tapi membuka login.html, otomatis lempar ke index.html
    checkAlreadyLoggedIn();
    
    // 2. Pasang Listener Submit Form Login
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
    }
  } else {
    // 3. Panggil Auth Guard untuk halaman terlindungi (index.html)
    applyAuthGuard();
    
    // 4. Setup Tombol Logout & Greeting Navbar jika ada di halaman
    setupNavbarUser();
  }
});

/**
 * Memeriksa apakah pengguna sudah terautentikasi (Auto Redirect jika sudah login)
 */
function checkAlreadyLoggedIn() {
  const firstName = localStorage.getItem("firstName");
  if (firstName) {
    window.location.href = "index.html";
  }
}

/**
 * Autentikasi API & Handling Submit Form
 */
async function handleLogin(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const errorMessageDiv = document.getElementById("error-message");

  // Reset tampilan error
  hideError(errorMessageDiv);

  // Jalankan Loading State
  setLoadingState(true);

  try {
    // Mengambil daftar users dari DummyJSON API menggunakan fetch()
    const response = await fetch(USERS_API_URL);
    
    if (!response.ok) {
      throw new Error("Gagal terhubung ke server. Silakan coba lagi.");
    }

    const data = await response.json();
    const users = data.users;

    // Validasi kredensial pengguna (Username & Password)
    const validUser = users.find(
      (user) => user.username === usernameInput && user.password === passwordInput
    );

    if (validUser) {
      // Session Persistence: Simpan firstName ke Local Storage
      localStorage.setItem("firstName", validUser.firstName);

      // Auto Redirect ke Halaman Katalog Produk
      window.location.href = "index.html";
    } else {
      showError(errorMessageDiv, "Username atau password yang Anda masukkan salah.");
    }
  } catch (error) {
    console.error("Error Autentikasi:", error);
    showError(errorMessageDiv, error.message || "Terjadi kesalahan koneksi API.");
  } finally {
    setLoadingState(false);
  }
}

/**
 * Auth Guard: Proteksi Halaman index.html
 */
function applyAuthGuard() {
  const firstName = localStorage.getItem("firstName");
  if (!firstName) {
    // Redirect paksa ke login.html jika belum login
    window.location.href = "login.html";
  }
}

/**
 * Menyiapkan Nama Pengguna & Handler Logout di Navbar (Digunakan di index.html)
 */
function setupNavbarUser() {
  const firstName = localStorage.getItem("firstName");
  const userGreetingElement = document.getElementById("user-greeting");
  const logoutBtn = document.getElementById("btn-logout");

  if (userGreetingElement && firstName) {
    userGreetingElement.textContent = `Selamat datang, ${firstName}`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Hapus data sesi dari Local Storage & redirect
      localStorage.removeItem("firstName");
      window.location.href = "login.html";
    });
  }
}

// ==========================================
// HELPER FUNCTIONS (UI States & Errors)
// ==========================================

function setLoadingState(isLoading) {
  const btnSubmit = document.getElementById("btn-submit");
  const btnText = document.getElementById("btn-text");
  const btnLoading = document.getElementById("btn-loading");

  if (!btnSubmit || !btnText || !btnLoading) return;

  btnSubmit.disabled = isLoading;
  if (isLoading) {
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
  } else {
    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
  }
}

function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.remove("hidden");
  }
}

function hideError(element) {
  if (element) {
    element.textContent = "";
    element.classList.add("hidden");
  }
}