// ===== Ventas =====
import { db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

export async function registerSale(saleData) {
  saleData.fecha = serverTimestamp();
  return addDoc(collection(db, "ventas"), saleData);
}

export async function getSales() {
  const q = query(collection(db, "ventas"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
