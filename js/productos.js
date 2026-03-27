// ===== Productos =====
import { db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

export async function saveProduct(productData, userId) {
  productData.creadoPor = userId;
  productData.creadoEn = serverTimestamp();
  return addDoc(collection(db, "productos"), productData);
}

export async function getProducts() {
  const snap = await getDocs(collection(db, "productos"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
