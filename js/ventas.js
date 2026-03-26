/* ============================================
   Ventas Module (ventas.html + historial.html)
   ============================================ */

// --- Sales page ---
async function initSalesPage(userData) {
  const grid = document.getElementById("products-grid");
  const searchInput = document.getElementById("search-input");
  const statusDot = document.getElementById("status-dot");
  const statusTime = document.getElementById("status-time");
  const statusMsg = document.getElementById("status-msg");
  const isVendedor = userData.role === "vendedor";
  let products = [];

  // Update time status
  function updateStatus() {
    const active = isWithinSalesHours();
    statusDot.className = "status-dot " + (active ? "active" : "inactive");
    statusTime.textContent = getBoliviaTimeString();
    if (statusMsg) {
      statusMsg.textContent = active ? "" : "⏰ " + getSalesStatusMessage();
      statusMsg.style.display = active ? "none" : "block";
    }
    return active;
  }

  updateStatus();
  setInterval(updateStatus, 30000);

  // Load products
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const snap = await db.collection("productos").get();
    products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts(products);
  } catch (err) {
    grid.innerHTML = '<p class="empty-state">Error al cargar productos</p>';
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase();
      const filtered = products.filter(p =>
        [p.tipo, p.color, p.marca, p.codigo].some(v => (v || "").toLowerCase().includes(q))
      );
      renderProducts(filtered);
    });
  }

  // Render products
  function renderProducts(items) {
    if (items.length === 0) {
      grid.innerHTML = '<p class="empty-state">No se encontraron productos</p>';
      return;
    }

    const active = isWithinSalesHours();

    grid.innerHTML = items.map(p => `
      <div class="card product-card">
        <div class="card-body">
          <div class="product-header">
            <div>
              <span class="badge badge-secondary" style="text-transform:capitalize">${sanitize(p.tipo)}</span>
              ${p.tipoSello ? `<span class="badge badge-outline" style="text-transform:capitalize;margin-left:4px">${sanitize(p.tipoSello)}</span>` : ""}
              <p class="product-brand">${sanitize(p.marca)}</p>
              <p class="product-code">Código: ${sanitize(p.codigo)}</p>
            </div>
            <span class="product-price">Bs ${p.precio.toFixed(2)}</span>
          </div>
          <div class="product-details">
            <span>Color: ${sanitize(p.color)}</span>
            ${p.tamano ? `<span>· Tamaño: ${sanitize(p.tamano)}</span>` : ""}
            ${p.medida ? `<span>· Medida: ${sanitize(p.medida)}</span>` : ""}
            ${p.cantidad ? `<span>· Cantidad: ${p.cantidad}</span>` : ""}
          </div>
          ${isVendedor ? `
            <button class="${active ? 'btn btn-sell-active' : 'btn btn-sell-disabled'}" 
              ${active ? '' : 'disabled'} 
              onclick="handleSell('${p.id}')">
              ${active ? '🟢 Vender' : '🔴 Fuera de horario'}
            </button>
          ` : ""}
        </div>
      </div>
    `).join("");
  }

  // Sell handler - made global
  window.handleSell = async function(productId) {
    if (!isWithinSalesHours()) {
      showToast("Fuera del horario de ventas", "error");
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      await db.collection("ventas").add({
        productoId: product.id,
        producto: product.tipo,
        codigo: product.codigo,
        precio: product.precio,
        color: product.color,
        marca: product.marca,
        usuario: userData.uid,
        nombreUsuario: userData.displayName || "Desconocido",
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast(`Venta registrada: ${product.codigo} - Bs ${product.precio.toFixed(2)}`);
    } catch (err) {
      showToast("Error al registrar venta", "error");
    }
  };
}

// --- Sales History page ---
async function initHistoryPage(userData) {
  const tbody = document.getElementById("sales-tbody");
  const totalEl = document.getElementById("stat-total");
  const countEl = document.getElementById("stat-count");
  const gastosEl = document.getElementById("stat-gastos");
  const balanceEl = document.getElementById("stat-balance");
  const gastosInput = document.getElementById("gastos-input");
  const salesCountEl = document.getElementById("sales-count");
  let sales = [];

  // Load sales
  try {
    const snap = await db.collection("ventas").orderBy("fecha", "desc").get();
    sales = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    showToast("Error al cargar ventas", "error");
  }

  const totalVendido = sales.reduce((sum, s) => sum + (s.precio || 0), 0);

  function updateStats() {
    const gastos = parseFloat(gastosInput?.value) || 0;
    const balance = totalVendido - gastos;

    if (totalEl) totalEl.textContent = `Bs ${totalVendido.toFixed(2)}`;
    if (countEl) countEl.textContent = sales.length;
    if (gastosEl) gastosEl.textContent = `Bs ${gastos.toFixed(2)}`;
    if (balanceEl) {
      balanceEl.textContent = `Bs ${balance.toFixed(2)}`;
      balanceEl.className = "stat-value " + (balance >= 0 ? "positive" : "negative");
    }
    if (salesCountEl) salesCountEl.textContent = sales.length;
  }

  updateStats();

  if (gastosInput) {
    gastosInput.addEventListener("input", updateStats);
  }

  // Render table
  if (tbody) {
    if (sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay ventas registradas</td></tr>';
    } else {
      tbody.innerHTML = sales.map(s => {
        const fecha = s.fecha?.toDate ? s.fecha.toDate().toLocaleString("es-BO") : "-";
        return `
          <tr>
            <td style="text-transform:capitalize;font-weight:500">${sanitize(s.producto)}</td>
            <td>${sanitize(s.codigo)}</td>
            <td>${sanitize(s.color)}</td>
            <td style="font-weight:600;color:var(--primary)">Bs ${(s.precio || 0).toFixed(2)}</td>
            <td>${sanitize(s.nombreUsuario)}</td>
            <td style="color:var(--muted-fg);font-size:0.75rem">${fecha}</td>
          </tr>
        `;
      }).join("");
    }
  }
}
