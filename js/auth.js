// ===== Autenticación =====
import { auth, db, googleProvider } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  doc, getDoc, setDoc,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Verificar sesión en páginas protegidas
export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    const userData = await getUserData(user);
    if (callback) callback(user, userData);
  });
}

// Obtener datos del usuario desde Firestore
export async function getUserData(user) {
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  // Crear si no existe
  const data = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "Usuario",
    role: "comprador",
    isAnonymous: user.isAnonymous,
  };
  await setDoc(ref, data);
  return data;
}

// Login con email
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Registrar con email
export async function registerWithEmail(email, password, name, role) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const data = {
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: name,
    role: role || "comprador",
    isAnonymous: false,
  };
  await setDoc(doc(db, "usuarios", cred.user.uid), data);
  try { await sendEmailVerification(cred.user); } catch (e) { console.warn("No se pudo enviar verificación:", e); }
  return cred;
}

// Login con Google
export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (err?.code === "auth/popup-blocked" || err?.code === "auth/unauthorized-domain") {
      const { signInWithRedirect } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
      return signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
}

// Login como invitado
export async function loginAsGuest() {
  return signInAnonymously(auth);
}

// Cerrar sesión
export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

export { onAuthStateChanged, auth };
