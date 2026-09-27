const USERS_API_URL = "https://dummyjson.com/users";
document.addEventListener("DOMContentLoaded", () => {
  const isLoginPage = window.location.pathname.endsWith("login.html");

  if (isLoginPage) {
    checkAlreadyLoggedIn();
    
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
    }
  } else {
    applyAuthGuard();
    
    setupNavbarUser();
  }
});

function checkAlreadyLoggedIn() {
  const firstName = localStorage.getItem("firstName");
  if (firstName) {
    window.location.href = "index.html";
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value.trim();
  const errorMessageDiv = document.getElementById("error-message");
  hideError(errorMessageDiv);

  setLoadingState(true);

  try {
    const response = await fetch(USERS_API_URL);
    
    if (!response.ok) {
      throw new Error("Gagal terhubung ke server. Silakan coba lagi.");
    }

    const data = await response.json();
    const users = data.users;

    const validUser = users.find(
      (user) => user.username === usernameInput && user.password === passwordInput
    );

    if (validUser) {
      localStorage.setItem("firstName", validUser.firstName);

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


function applyAuthGuard() {
  const firstName = localStorage.getItem("firstName");
  if (!firstName) {
    window.location.href = "login.html";
  }
}

function setupNavbarUser() {
  const firstName = localStorage.getItem("firstName");
  const userGreetingElement = document.getElementById("user-greeting");
  const logoutBtn = document.getElementById("btn-logout");

  if (userGreetingElement && firstName) {
    userGreetingElement.textContent = `Selamat datang, ${firstName}`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("firstName");
      window.location.href = "login.html";
    });
  }
}

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