/* ============================================
   Productos Module (subir.html)
   ============================================ */

function initUploadPage(userData) {
  const typeSelect = document.getElementById("product-type");
  const dynamicFields = document.getElementById("dynamic-fields");
  const form = document.getElementById("upload-form");

  // Show/hide fields based on type
  typeSelect.addEventListener("change", () => {
    const type = typeSelect.value;
    dynamicFields.innerHTML = "";

    if (!type) return;

    let html = `
      <div class="form-grid">
        <div class="form-group">
          <label>Color *</label>
          <input type="text" id="f-color" placeholder="Ej: Azul" maxlength="50" required>
        </div>
        <div class="form-group">
          <label>Marca *</label>
          <input type="text" id="f-marca" placeholder="Ej: Trodat" maxlength="100" required>
        </div>
        <div class="form-group">
          <label>Código *</label>
          <input type="text" id="f-codigo" placeholder="Ej: TR-001" maxlength="50" required>
        </div>
        <div class="form-group">
          <label>Precio (Bs) *</label>
          <input type="number" id="f-precio" step="0.01" min="0" placeholder="0.00" required>
        </div>
      </div>
    `;

    if (type === "sello") {
      html = `
        <div class="form-group">
          <label>Tipo de sello *</label>
          <select id="f-tipoSello" required>
            <option value="">Selecciona tipo de sello</option>
            <option value="automatico">Automático</option>
            <option value="redondo">Redondo</option>
            <option value="ovalo">Óvalo</option>
            <option value="cuadrado">Cuadrado</option>
            <option value="rectangulo">Rectángulo</option>
            <option value="triangulo">Triángulo</option>
            <option value="lineal">Lineal</option>
          </select>
        </div>
      ` + html + `
        <div class="form-grid mt-2">
          <div class="form-group">
            <label>Medida *</label>
            <input type="text" id="f-medida" placeholder="Ej: 40x60mm" maxlength="50" required>
          </div>
          <div class="form-group">
            <label>Color del tampo *</label>
            <input type="text" id="f-colorTampo" placeholder="Ej: Rojo" maxlength="50" required>
          </div>
          <div class="form-group">
            <label>Cantidad *</label>
            <input type="number" id="f-cantidad" min="1" placeholder="1" required>
          </div>
        </div>
      `;
    } else if (type === "tampo") {
      html += `
        <div class="form-grid mt-2">
          <div class="form-group">
            <label>Tamaño *</label>
            <input type="text" id="f-tamano" placeholder="Ej: Grande" maxlength="50" required>
          </div>
          <div class="form-group">
            <label>Cantidad *</label>
            <input type="number" id="f-cantidad" min="1" placeholder="1" required>
          </div>
        </div>
      `;
    }

    html += `<button type="submit" class="btn btn-primary btn-full mt-2">💾 Guardar Producto</button>`;
    dynamicFields.innerHTML = html;
  });

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = typeSelect.value;
    if (!type) { showToast("Selecciona un tipo de producto", "error"); return; }

    const color = document.getElementById("f-color")?.value?.trim();
    const marca = document.getElementById("f-marca")?.value?.trim();
    const codigo = document.getElementById("f-codigo")?.value?.trim();
    const precio = parseFloat(document.getElementById("f-precio")?.value);

    if (!color || !marca || !codigo || isNaN(precio) || precio <= 0) {
      showToast("Completa todos los campos requeridos", "error");
      return;
    }

    const data = {
      tipo: type,
      color: sanitize(color),
      marca: sanitize(marca),
      codigo: sanitize(codigo),
      precio: precio,
      creadoPor: userData.uid,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (type === "tampo") {
      const tamano = document.getElementById("f-tamano")?.value?.trim();
      const cantidad = parseInt(document.getElementById("f-cantidad")?.value);
      if (!tamano || isNaN(cantidad)) { showToast("Completa tamaño y cantidad", "error"); return; }
      data.tamano = sanitize(tamano);
      data.cantidad = cantidad;
    }

    if (type === "sello") {
      const tipoSello = document.getElementById("f-tipoSello")?.value;
      const medida = document.getElementById("f-medida")?.value?.trim();
      const colorTampo = document.getElementById("f-colorTampo")?.value?.trim();
      const cantidad = parseInt(document.getElementById("f-cantidad")?.value);
      if (!tipoSello || !medida || !colorTampo || isNaN(cantidad)) {
        showToast("Completa todos los campos del sello", "error"); return;
      }
      data.tipoSello = tipoSello;
      data.medida = sanitize(medida);
      data.colorTampo = sanitize(colorTampo);
      data.cantidad = cantidad;
    }

    if (type === "tinta") {
      data.cantidad = 1;
    }

    try {
      await db.collection("productos").add(data);
      showToast("Producto guardado correctamente");
      form.reset();
      dynamicFields.innerHTML = "";
    } catch (err) {
      showToast("Error al guardar: " + err.message, "error");
    }
  });
}
