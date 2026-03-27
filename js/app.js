// ===== Utilidades globales =====

// Toast notifications
const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

// Bolivia timezone (UTC-4)
export function getBoliviaTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 4 * 3600000);
}

export function isWithinSalesHours() {
  const h = getBoliviaTime().getHours();
  return h >= 6 && h < 21;
}

export function getBoliviaTimeString() {
  return getBoliviaTime().toLocaleTimeString("es-BO", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export function getSalesStatusMessage() {
  return isWithinSalesHours()
    ? "Ventas activas (06:00 AM - 09:00 PM Bolivia)"
    : "Fuera de horario de ventas (06:00 AM - 09:00 PM Bolivia)";
}

// Firebase error translator
export function getFirebaseError(err) {
  const code = err?.code || "";
  const map = {
    "auth/user-not-found": "No existe una cuenta con ese email",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-credential": "Email o contraseña incorrectos",
    "auth/email-already-in-use": "Ya existe una cuenta con ese email",
    "auth/invalid-email": "El formato del email no es válido",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos",
    "auth/network-request-failed": "Error de conexión. Verifica tu internet",
    "auth/popup-closed-by-user": "Se cerró la ventana de Google",
    "auth/popup-blocked": "El navegador bloqueó la ventana emergente",
    "auth/unauthorized-domain": "Dominio no autorizado en Firebase. Agrégalo en Firebase Console → Authentication → Settings → Authorized domains",
    "auth/admin-restricted-operation": "Operación desactivada. Actívala en Firebase Console → Authentication → Sign-in method",
    "auth/operation-not-allowed": "Este método de inicio de sesión no está habilitado en Firebase",
  };
  return map[code] || err?.message || "Error de autenticación desconocido";
}
