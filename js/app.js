/* ============================================
   App Utilities
   ============================================ */

// --- Bolivia Time (UTC-4) ---
function getBoliviaTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 4 * 3600000);
}

function isWithinSalesHours() {
  const bt = getBoliviaTime();
  const hour = bt.getHours();
  return hour >= 6 && hour < 21;
}

function getBoliviaTimeString() {
  const bt = getBoliviaTime();
  return bt.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getSalesStatusMessage() {
  return isWithinSalesHours()
    ? "Ventas activas (06:00 AM - 09:00 PM Bolivia)"
    : "Fuera de horario de ventas (06:00 AM - 09:00 PM Bolivia)";
}

// --- Toast notifications ---
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Setup sidebar navigation ---
function setupSidebar(userData, activePage) {
  const isVendedor = userData && userData.role === "vendedor";

  // Desktop sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    const navItems = [
      { label: "Dashboard", path: "dashboard.html", icon: "📊", show: true },
      { label: "Subir Productos", path: "subir.html", icon: "📦", show: isVendedor },
      { label: "Ventas", path: "ventas.html", icon: "🛒", show: true },
      { label: "Control de Ventas", path: "historial.html", icon: "📈", show: isVendedor },
      { label: "Mi Cuenta", path: "cuenta.html", icon: "👤", show: true }
    ];

    const nav = sidebar.querySelector(".sidebar-nav");
    nav.innerHTML = navItems.filter(i => i.show).map(item =>
      `<a href="${item.path}" class="${activePage === item.path ? 'active' : ''}">${item.icon} ${item.label}</a>`
    ).join("");

    // User info
    const userInfo = sidebar.querySelector(".sidebar-user");
    if (userInfo) {
      const initial = (userData.displayName || "U")[0].toUpperCase();
      userInfo.innerHTML = `
        <div class="sidebar-avatar">${initial}</div>
        <div class="sidebar-user-info">
          <p>${userData.displayName || "Usuario"}</p>
          <p>${userData.role}</p>
        </div>
      `;
    }

    // Logout
    const logoutBtn = sidebar.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  }

  // Mobile nav
  const mobileNav = document.getElementById("mobile-nav");
  if (mobileNav) {
    const navItems = [
      { label: "Dashboard", path: "dashboard.html", icon: "📊", show: true },
      { label: "Subir Productos", path: "subir.html", icon: "📦", show: isVendedor },
      { label: "Ventas", path: "ventas.html", icon: "🛒", show: true },
      { label: "Control de Ventas", path: "historial.html", icon: "📈", show: isVendedor },
      { label: "Mi Cuenta", path: "cuenta.html", icon: "👤", show: true }
    ];

    mobileNav.innerHTML = navItems.filter(i => i.show).map(item =>
      `<a href="${item.path}" class="${activePage === item.path ? 'active' : ''}">${item.icon} ${item.label}</a>`
    ).join("") + `<a href="#" onclick="logout(); return false;" style="color: var(--destructive);">🚪 Cerrar sesión</a>`;
  }

  // Hamburger toggle
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const nav = document.getElementById("mobile-nav");
      nav.classList.toggle("open");
    });
  }
}

// --- Input validation helpers ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
