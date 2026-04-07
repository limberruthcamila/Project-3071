/* ============================================================
   EarnFlow - Sistema de Gestión de Negocios
   app.js - Lógica principal de la aplicación
   
   Este archivo contiene toda la lógica de la aplicación:
   - Conexión con Firebase Firestore
   - CRUD de ventas, gastos, productos y clientes
   - Cálculos de reportes y estadísticas
   - Navegación entre secciones
   - Notificaciones y modales
   ============================================================ */

// ==================== CONFIGURACIÓN DE FIREBASE ====================
// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAM3MZ2Bw0AWnTKNpX3PBbfOkcscXDu4yA",
  authDomain: "earnflow-3081-rcl.firebaseapp.com",
  projectId: "earnflow-3081-rcl",
  storageBucket: "earnflow-3081-rcl.firebasestorage.app",
  messagingSenderId: "1033850640627",
  appId: "1:1033850640627:web:f71c783761b95bd198bf86",
  measurementId: "G-M4X6JNLKG8"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos Firestore
const db = firebase.firestore();

// Referencias a las colecciones de Firestore
const ventasRef = db.collection('ventas');
const gastosRef = db.collection('gastos');
const productosRef = db.collection('productos');
const clientesRef = db.collection('clientes');

// ==================== VARIABLES GLOBALES ====================
// Datos locales sincronizados con Firestore
let ventas = [];
let gastos = [];
let productos = [];
let clientes = [];

// Variable para almacenar la función de confirmación del modal
let modalCallback = null;

// ==================== INICIALIZACIÓN ====================
// Cuando el DOM esté listo, configurar todo
document.addEventListener('DOMContentLoaded', function() {
    configurarFechaActual();
    configurarNavegacion();
    configurarSidebar();
    configurarFormularios();
    configurarFiltros();
    configurarModal();
    configurarBusquedas();
    escucharDatosEnTiempoReal();
});

// ==================== FECHA ACTUAL ====================
/**
 * Muestra la fecha actual en el top bar
 * y establece las fechas por defecto en los formularios
 */
function configurarFechaActual() {
    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones);
    
    // Mostrar fecha en el header
    document.getElementById('currentDate').textContent = fechaFormateada;
    
    // Establecer fecha de hoy en los campos de fecha
    const fechaISO = hoy.toISOString().split('T')[0];
    const camposFecha = ['ventaFecha', 'gastoFecha'];
    camposFecha.forEach(function(id) {
        const campo = document.getElementById(id);
        if (campo) campo.value = fechaISO;
    });
}

// ==================== NAVEGACIÓN ====================
/**
 * Configura la navegación entre secciones del sidebar
 */
function configurarNavegacion() {
    // Obtener todos los items del menú
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener la sección a mostrar
            const seccion = this.getAttribute('data-section');
            
            // Remover clase 'active' de todos los items
            navItems.forEach(function(nav) { nav.classList.remove('active'); });
            
            // Agregar clase 'active' al item actual
            this.classList.add('active');
            
            // Ocultar todas las secciones
            document.querySelectorAll('.section').forEach(function(sec) {
                sec.classList.remove('active');
            });
            
            // Mostrar la sección seleccionada
            document.getElementById('section-' + seccion).classList.add('active');
            
            // Actualizar título de la página
            const titulos = {
                dashboard: 'Dashboard',
                ventas: 'Registro de Ventas',
                gastos: 'Control de Gastos',
                productos: 'Productos e Inventario',
                clientes: 'Gestión de Clientes',
                historial: 'Historial de Transacciones',
                reportes: 'Reportes y Estadísticas'
            };
            document.getElementById('pageTitle').textContent = titulos[seccion] || 'Dashboard';
            
            // En móvil, cerrar el sidebar después de navegar
            cerrarSidebar();
        });
    });
}

// ==================== SIDEBAR MÓVIL ====================
/**
 * Configura el comportamiento del sidebar en dispositivos móviles
 */
function configurarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    
    // Crear overlay para cerrar sidebar en móvil
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    document.body.appendChild(overlay);
    
    // Abrir sidebar
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });
    
    // Cerrar sidebar con botón X
    sidebarClose.addEventListener('click', cerrarSidebar);
    
    // Cerrar sidebar al hacer clic en el overlay
    overlay.addEventListener('click', cerrarSidebar);
}

/**
 * Cierra el sidebar en modo móvil
 */
function cerrarSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    var overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('show');
}

// ==================== FIREBASE EN TIEMPO REAL ====================
/**
 * Establece listeners en tiempo real para todas las colecciones
 * Esto significa que cuando alguien agrega, edita o borra datos
 * en cualquier dispositivo, la app se actualiza automáticamente
 */
function escucharDatosEnTiempoReal() {
    // Escuchar cambios en la colección de productos
    productosRef.orderBy('nombre').onSnapshot(function(snapshot) {
        productos = [];
        snapshot.forEach(function(doc) {
            productos.push({ id: doc.id, ...doc.data() });
        });
        renderizarProductos();
        actualizarSelectProductos();
        actualizarStockBajo();
        actualizarDashboard();
        actualizarReportes();
    }, function(error) {
        console.error('Error al escuchar productos:', error);
        mostrarToast('Error al cargar productos', 'error');
    });

    // Escuchar cambios en la colección de clientes
    clientesRef.orderBy('nombre').onSnapshot(function(snapshot) {
        clientes = [];
        snapshot.forEach(function(doc) {
            clientes.push({ id: doc.id, ...doc.data() });
        });
        renderizarClientes();
        actualizarSelectClientes();
        actualizarReportes();
    }, function(error) {
        console.error('Error al escuchar clientes:', error);
        mostrarToast('Error al cargar clientes', 'error');
    });

    // Escuchar cambios en la colección de ventas
    ventasRef.orderBy('fecha', 'desc').onSnapshot(function(snapshot) {
        ventas = [];
        snapshot.forEach(function(doc) {
            ventas.push({ id: doc.id, ...doc.data() });
        });
        renderizarVentas();
        actualizarDashboard();
        actualizarHistorial();
        actualizarReportes();
    }, function(error) {
        console.error('Error al escuchar ventas:', error);
        mostrarToast('Error al cargar ventas', 'error');
    });

    // Escuchar cambios en la colección de gastos
    gastosRef.orderBy('fecha', 'desc').onSnapshot(function(snapshot) {
        gastos = [];
        snapshot.forEach(function(doc) {
            gastos.push({ id: doc.id, ...doc.data() });
        });
        renderizarGastos();
        actualizarDashboard();
        actualizarHistorial();
        actualizarReportes();
    }, function(error) {
        console.error('Error al escuchar gastos:', error);
        mostrarToast('Error al cargar gastos', 'error');
    });
}

// ==================== FORMULARIOS ====================
/**
 * Configura los eventos de todos los formularios
 */
function configurarFormularios() {
    // ---- Formulario de Ventas ----
    document.getElementById('formVenta').addEventListener('submit', function(e) {
        e.preventDefault();
        registrarVenta();
    });

    // Calcular total automáticamente al cambiar cantidad o precio
    document.getElementById('ventaCantidad').addEventListener('input', calcularTotalVenta);
    document.getElementById('ventaPrecio').addEventListener('input', calcularTotalVenta);
    
    // Auto-llenar precio al seleccionar producto
    document.getElementById('ventaProducto').addEventListener('change', function() {
        var productoId = this.value;
        if (productoId) {
            var producto = productos.find(function(p) { return p.id === productoId; });
            if (producto) {
                document.getElementById('ventaPrecio').value = producto.precio;
                calcularTotalVenta();
            }
        }
    });

    // ---- Formulario de Gastos ----
    document.getElementById('formGasto').addEventListener('submit', function(e) {
        e.preventDefault();
        registrarGasto();
    });

    // ---- Formulario de Productos ----
    document.getElementById('formProducto').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarProducto();
    });

    // Botón cancelar edición de producto
    document.getElementById('btnCancelProducto').addEventListener('click', function() {
        limpiarFormularioProducto();
    });

    // ---- Formulario de Clientes ----
    document.getElementById('formCliente').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarCliente();
    });

    // Botón cancelar edición de cliente
    document.getElementById('btnCancelCliente').addEventListener('click', function() {
        limpiarFormularioCliente();
    });
}

// ==================== VENTAS ====================
/**
 * Calcula el total de la venta en base a cantidad y precio
 */
function calcularTotalVenta() {
    var cantidad = parseFloat(document.getElementById('ventaCantidad').value) || 0;
    var precio = parseFloat(document.getElementById('ventaPrecio').value) || 0;
    var total = cantidad * precio;
    document.getElementById('ventaTotal').textContent = '$' + total.toFixed(2);
}

/**
 * Registra una nueva venta en Firestore
 * También descuenta el stock del producto
 */
function registrarVenta() {
    var productoId = document.getElementById('ventaProducto').value;
    var cantidad = parseInt(document.getElementById('ventaCantidad').value);
    var precio = parseFloat(document.getElementById('ventaPrecio').value);
    var clienteId = document.getElementById('ventaCliente').value;
    var fecha = document.getElementById('ventaFecha').value;
    var notas = document.getElementById('ventaNotas').value;

    // Validaciones
    if (!productoId) {
        mostrarToast('Selecciona un producto', 'warning');
        return;
    }

    // Buscar el producto para verificar stock
    var producto = productos.find(function(p) { return p.id === productoId; });
    if (!producto) {
        mostrarToast('Producto no encontrado', 'error');
        return;
    }

    if (producto.stock < cantidad) {
        mostrarToast('Stock insuficiente. Disponible: ' + producto.stock, 'warning');
        return;
    }

    // Buscar nombre del cliente si se seleccionó uno
    var clienteNombre = '';
    if (clienteId) {
        var cliente = clientes.find(function(c) { return c.id === clienteId; });
        if (cliente) clienteNombre = cliente.nombre;
    }

    // Crear objeto de venta
    var venta = {
        productoId: productoId,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        total: cantidad * precio,
        clienteId: clienteId || '',
        clienteNombre: clienteNombre,
        fecha: fecha,
        notas: notas,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Guardar la venta en Firestore
    ventasRef.add(venta).then(function() {
        // Descontar stock del producto
        productosRef.doc(productoId).update({
            stock: firebase.firestore.FieldValue.increment(-cantidad)
        });

        // Actualizar contador de compras del cliente
        if (clienteId) {
            clientesRef.doc(clienteId).update({
                compras: firebase.firestore.FieldValue.increment(1),
                totalGastado: firebase.firestore.FieldValue.increment(cantidad * precio)
            });
        }

        mostrarToast('Venta registrada exitosamente', 'success');
        document.getElementById('formVenta').reset();
        configurarFechaActual();
        document.getElementById('ventaTotal').textContent = '$0.00';
    }).catch(function(error) {
        console.error('Error al registrar venta:', error);
        mostrarToast('Error al registrar venta', 'error');
    });
}

/**
 * Renderiza la tabla de ventas recientes
 */
function renderizarVentas() {
    var tbody = document.getElementById('ventasTable');
    var emptyMsg = document.getElementById('emptyVentas');

    if (ventas.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    
    // Mostrar solo las últimas 20 ventas
    var ventasMostrar = ventas.slice(0, 20);
    
    tbody.innerHTML = ventasMostrar.map(function(v) {
        return '<tr>' +
            '<td>' + formatearFecha(v.fecha) + '</td>' +
            '<td>' + escapeHTML(v.productoNombre) + '</td>' +
            '<td>' + v.cantidad + '</td>' +
            '<td>$' + v.precioUnitario.toFixed(2) + '</td>' +
            '<td><strong>$' + v.total.toFixed(2) + '</strong></td>' +
            '<td>' + (v.clienteNombre || '-') + '</td>' +
            '<td>' +
                '<button class="btn-icon delete" onclick="eliminarVenta(\'' + v.id + '\')" title="Eliminar">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

/**
 * Elimina una venta después de confirmación
 */
function eliminarVenta(id) {
    mostrarModal('Eliminar Venta', '¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.', function() {
        var venta = ventas.find(function(v) { return v.id === id; });
        
        ventasRef.doc(id).delete().then(function() {
            // Devolver stock al producto
            if (venta && venta.productoId) {
                productosRef.doc(venta.productoId).update({
                    stock: firebase.firestore.FieldValue.increment(venta.cantidad)
                }).catch(function() {});
            }
            mostrarToast('Venta eliminada', 'success');
        }).catch(function(error) {
            console.error('Error al eliminar venta:', error);
            mostrarToast('Error al eliminar venta', 'error');
        });
    });
}

// ==================== GASTOS ====================
/**
 * Registra un nuevo gasto en Firestore
 */
function registrarGasto() {
    var descripcion = document.getElementById('gastoDescripcion').value.trim();
    var categoria = document.getElementById('gastoCategoria').value;
    var monto = parseFloat(document.getElementById('gastoMonto').value);
    var fecha = document.getElementById('gastoFecha').value;

    if (!descripcion || !categoria || !monto || !fecha) {
        mostrarToast('Completa todos los campos', 'warning');
        return;
    }

    var gasto = {
        descripcion: descripcion,
        categoria: categoria,
        monto: monto,
        fecha: fecha,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    gastosRef.add(gasto).then(function() {
        mostrarToast('Gasto registrado exitosamente', 'success');
        document.getElementById('formGasto').reset();
        configurarFechaActual();
    }).catch(function(error) {
        console.error('Error al registrar gasto:', error);
        mostrarToast('Error al registrar gasto', 'error');
    });
}

/**
 * Renderiza la tabla de gastos
 */
function renderizarGastos() {
    var tbody = document.getElementById('gastosTable');
    var emptyMsg = document.getElementById('emptyGastos');

    if (gastos.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    
    var gastosMostrar = gastos.slice(0, 20);
    
    tbody.innerHTML = gastosMostrar.map(function(g) {
        return '<tr>' +
            '<td>' + formatearFecha(g.fecha) + '</td>' +
            '<td>' + escapeHTML(g.descripcion) + '</td>' +
            '<td><span class="badge badge-warning">' + escapeHTML(g.categoria) + '</span></td>' +
            '<td><strong>$' + g.monto.toFixed(2) + '</strong></td>' +
            '<td>' +
                '<button class="btn-icon delete" onclick="eliminarGasto(\'' + g.id + '\')" title="Eliminar">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

/**
 * Elimina un gasto después de confirmación
 */
function eliminarGasto(id) {
    mostrarModal('Eliminar Gasto', '¿Estás seguro de que deseas eliminar este gasto?', function() {
        gastosRef.doc(id).delete().then(function() {
            mostrarToast('Gasto eliminado', 'success');
        }).catch(function(error) {
            console.error('Error al eliminar gasto:', error);
            mostrarToast('Error al eliminar gasto', 'error');
        });
    });
}

// ==================== PRODUCTOS ====================
/**
 * Guarda un producto nuevo o actualiza uno existente
 */
function guardarProducto() {
    var id = document.getElementById('productoId').value;
    var nombre = document.getElementById('productoNombre').value.trim();
    var categoria = document.getElementById('productoCategoria').value.trim();
    var precio = parseFloat(document.getElementById('productoPrecio').value);
    var costo = parseFloat(document.getElementById('productoCosto').value);
    var stock = parseInt(document.getElementById('productoStock').value);
    var stockMin = parseInt(document.getElementById('productoStockMin').value) || 5;

    if (!nombre || isNaN(precio) || isNaN(costo)) {
        mostrarToast('Completa los campos obligatorios', 'warning');
        return;
    }

    var producto = {
        nombre: nombre,
        categoria: categoria || 'General',
        precio: precio,
        costo: costo,
        stock: stock,
        stockMinimo: stockMin,
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (id) {
        // Actualizar producto existente
        productosRef.doc(id).update(producto).then(function() {
            mostrarToast('Producto actualizado', 'success');
            limpiarFormularioProducto();
        }).catch(function(error) {
            console.error('Error al actualizar producto:', error);
            mostrarToast('Error al actualizar producto', 'error');
        });
    } else {
        // Crear nuevo producto
        producto.creadoEn = firebase.firestore.FieldValue.serverTimestamp();
        productosRef.add(producto).then(function() {
            mostrarToast('Producto creado exitosamente', 'success');
            limpiarFormularioProducto();
        }).catch(function(error) {
            console.error('Error al crear producto:', error);
            mostrarToast('Error al crear producto', 'error');
        });
    }
}

/**
 * Renderiza la tabla de productos
 */
function renderizarProductos() {
    var tbody = document.getElementById('productosTable');
    var emptyMsg = document.getElementById('emptyProductos');
    var busqueda = (document.getElementById('buscarProducto').value || '').toLowerCase();

    var productosFiltrados = productos.filter(function(p) {
        return p.nombre.toLowerCase().includes(busqueda) || 
               (p.categoria && p.categoria.toLowerCase().includes(busqueda));
    });

    if (productosFiltrados.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    tbody.innerHTML = productosFiltrados.map(function(p) {
        var estadoBadge = '';
        if (p.stock <= 0) {
            estadoBadge = '<span class="badge badge-danger">Sin Stock</span>';
        } else if (p.stock <= (p.stockMinimo || 5)) {
            estadoBadge = '<span class="badge badge-warning">Bajo</span>';
        } else {
            estadoBadge = '<span class="badge badge-success">OK</span>';
        }

        return '<tr>' +
            '<td><strong>' + escapeHTML(p.nombre) + '</strong></td>' +
            '<td>' + escapeHTML(p.categoria || 'General') + '</td>' +
            '<td>$' + p.precio.toFixed(2) + '</td>' +
            '<td>$' + p.costo.toFixed(2) + '</td>' +
            '<td>' + p.stock + '</td>' +
            '<td>' + estadoBadge + '</td>' +
            '<td>' +
                '<button class="btn-icon edit" onclick="editarProducto(\'' + p.id + '\')" title="Editar">' +
                    '<i class="fas fa-pen"></i>' +
                '</button> ' +
                '<button class="btn-icon delete" onclick="eliminarProducto(\'' + p.id + '\')" title="Eliminar">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

/**
 * Carga los datos de un producto en el formulario para editarlo
 */
function editarProducto(id) {
    var producto = productos.find(function(p) { return p.id === id; });
    if (!producto) return;

    document.getElementById('productoId').value = id;
    document.getElementById('productoNombre').value = producto.nombre;
    document.getElementById('productoCategoria').value = producto.categoria || '';
    document.getElementById('productoPrecio').value = producto.precio;
    document.getElementById('productoCosto').value = producto.costo;
    document.getElementById('productoStock').value = producto.stock;
    document.getElementById('productoStockMin').value = producto.stockMinimo || 5;

    document.getElementById('btnProducto').innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
    document.getElementById('btnCancelProducto').style.display = 'inline-flex';

    // Scroll al formulario
    document.getElementById('section-productos').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Elimina un producto después de confirmación
 */
function eliminarProducto(id) {
    mostrarModal('Eliminar Producto', '¿Estás seguro de que deseas eliminar este producto? Se perderá toda la información.', function() {
        productosRef.doc(id).delete().then(function() {
            mostrarToast('Producto eliminado', 'success');
        }).catch(function(error) {
            console.error('Error al eliminar producto:', error);
            mostrarToast('Error al eliminar producto', 'error');
        });
    });
}

/**
 * Limpia el formulario de productos y vuelve al modo "crear"
 */
function limpiarFormularioProducto() {
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
    document.getElementById('btnProducto').innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    document.getElementById('btnCancelProducto').style.display = 'none';
}

/**
 * Actualiza el select de productos en el formulario de ventas
 */
function actualizarSelectProductos() {
    var select = document.getElementById('ventaProducto');
    var valorActual = select.value;
    
    select.innerHTML = '<option value="">Seleccionar producto...</option>';
    
    productos.forEach(function(p) {
        var option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nombre + ' (Stock: ' + p.stock + ') - $' + p.precio.toFixed(2);
        select.appendChild(option);
    });

    if (valorActual) select.value = valorActual;
}

// ==================== CLIENTES ====================
/**
 * Guarda un cliente nuevo o actualiza uno existente
 */
function guardarCliente() {
    var id = document.getElementById('clienteId').value;
    var nombre = document.getElementById('clienteNombre').value.trim();
    var telefono = document.getElementById('clienteTelefono').value.trim();
    var email = document.getElementById('clienteEmail').value.trim();
    var direccion = document.getElementById('clienteDireccion').value.trim();

    if (!nombre) {
        mostrarToast('El nombre es obligatorio', 'warning');
        return;
    }

    var cliente = {
        nombre: nombre,
        telefono: telefono,
        email: email,
        direccion: direccion,
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (id) {
        clientesRef.doc(id).update(cliente).then(function() {
            mostrarToast('Cliente actualizado', 'success');
            limpiarFormularioCliente();
        }).catch(function(error) {
            console.error('Error al actualizar cliente:', error);
            mostrarToast('Error al actualizar cliente', 'error');
        });
    } else {
        cliente.compras = 0;
        cliente.totalGastado = 0;
        cliente.creadoEn = firebase.firestore.FieldValue.serverTimestamp();
        clientesRef.add(cliente).then(function() {
            mostrarToast('Cliente creado exitosamente', 'success');
            limpiarFormularioCliente();
        }).catch(function(error) {
            console.error('Error al crear cliente:', error);
            mostrarToast('Error al crear cliente', 'error');
        });
    }
}

/**
 * Renderiza la tabla de clientes
 */
function renderizarClientes() {
    var tbody = document.getElementById('clientesTable');
    var emptyMsg = document.getElementById('emptyClientes');
    var busqueda = (document.getElementById('buscarCliente').value || '').toLowerCase();

    var clientesFiltrados = clientes.filter(function(c) {
        return c.nombre.toLowerCase().includes(busqueda) ||
               (c.email && c.email.toLowerCase().includes(busqueda)) ||
               (c.telefono && c.telefono.includes(busqueda));
    });

    if (clientesFiltrados.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    tbody.innerHTML = clientesFiltrados.map(function(c) {
        return '<tr>' +
            '<td><strong>' + escapeHTML(c.nombre) + '</strong></td>' +
            '<td>' + escapeHTML(c.telefono || '-') + '</td>' +
            '<td>' + escapeHTML(c.email || '-') + '</td>' +
            '<td>' + escapeHTML(c.direccion || '-') + '</td>' +
            '<td>' + (c.compras || 0) + '</td>' +
            '<td>' +
                '<button class="btn-icon edit" onclick="editarCliente(\'' + c.id + '\')" title="Editar">' +
                    '<i class="fas fa-pen"></i>' +
                '</button> ' +
                '<button class="btn-icon delete" onclick="eliminarCliente(\'' + c.id + '\')" title="Eliminar">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

/**
 * Carga los datos de un cliente en el formulario para editarlo
 */
function editarCliente(id) {
    var cliente = clientes.find(function(c) { return c.id === id; });
    if (!cliente) return;

    document.getElementById('clienteId').value = id;
    document.getElementById('clienteNombre').value = cliente.nombre;
    document.getElementById('clienteTelefono').value = cliente.telefono || '';
    document.getElementById('clienteEmail').value = cliente.email || '';
    document.getElementById('clienteDireccion').value = cliente.direccion || '';

    document.getElementById('btnCliente').innerHTML = '<i class="fas fa-save"></i> Actualizar Cliente';
    document.getElementById('btnCancelCliente').style.display = 'inline-flex';

    document.getElementById('section-clientes').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Elimina un cliente después de confirmación
 */
function eliminarCliente(id) {
    mostrarModal('Eliminar Cliente', '¿Estás seguro de que deseas eliminar este cliente?', function() {
        clientesRef.doc(id).delete().then(function() {
            mostrarToast('Cliente eliminado', 'success');
        }).catch(function(error) {
            console.error('Error al eliminar cliente:', error);
            mostrarToast('Error al eliminar cliente', 'error');
        });
    });
}

/**
 * Limpia el formulario de clientes
 */
function limpiarFormularioCliente() {
    document.getElementById('formCliente').reset();
    document.getElementById('clienteId').value = '';
    document.getElementById('btnCliente').innerHTML = '<i class="fas fa-save"></i> Guardar Cliente';
    document.getElementById('btnCancelCliente').style.display = 'none';
}

/**
 * Actualiza el select de clientes en el formulario de ventas
 */
function actualizarSelectClientes() {
    var select = document.getElementById('ventaCliente');
    var valorActual = select.value;
    
    select.innerHTML = '<option value="">Sin cliente</option>';
    
    clientes.forEach(function(c) {
        var option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.nombre;
        select.appendChild(option);
    });

    if (valorActual) select.value = valorActual;
}

// ==================== DASHBOARD ====================
/**
 * Actualiza las estadísticas del dashboard
 */
function actualizarDashboard() {
    var hoy = new Date().toISOString().split('T')[0];
    var ahora = new Date();
    var primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];

    // Ventas de hoy
    var ventasHoy = ventas
        .filter(function(v) { return v.fecha === hoy; })
        .reduce(function(sum, v) { return sum + v.total; }, 0);

    // Ingresos del mes
    var ingresosMes = ventas
        .filter(function(v) { return v.fecha >= primerDiaMes; })
        .reduce(function(sum, v) { return sum + v.total; }, 0);

    // Gastos del mes
    var gastosMes = gastos
        .filter(function(g) { return g.fecha >= primerDiaMes; })
        .reduce(function(sum, g) { return sum + g.monto; }, 0);

    // Ganancia neta
    var gananciaNeta = ingresosMes - gastosMes;

    // Actualizar los elementos del DOM
    document.getElementById('ventasHoy').textContent = '$' + ventasHoy.toFixed(2);
    document.getElementById('ingresosMes').textContent = '$' + ingresosMes.toFixed(2);
    document.getElementById('gastosMes').textContent = '$' + gastosMes.toFixed(2);
    document.getElementById('gananciaNeta').textContent = '$' + gananciaNeta.toFixed(2);
    
    // Cambiar color de ganancia según sea positiva o negativa
    var gananciaEl = document.getElementById('gananciaNeta');
    gananciaEl.style.color = gananciaNeta >= 0 ? '#10b981' : '#ef4444';

    // Últimas ventas en el dashboard
    renderizarUltimasVentas();
}

/**
 * Muestra las últimas 5 ventas en el dashboard
 */
function renderizarUltimasVentas() {
    var tbody = document.getElementById('ultimasVentasTable');
    var emptyMsg = document.getElementById('emptyVentasDash');

    if (ventas.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    var ultimas = ventas.slice(0, 5);

    tbody.innerHTML = ultimas.map(function(v) {
        return '<tr>' +
            '<td>' + escapeHTML(v.productoNombre) + '</td>' +
            '<td>' + v.cantidad + '</td>' +
            '<td><strong>$' + v.total.toFixed(2) + '</strong></td>' +
            '<td>' + formatearFecha(v.fecha) + '</td>' +
        '</tr>';
    }).join('');
}

/**
 * Muestra productos con stock bajo en el dashboard
 */
function actualizarStockBajo() {
    var container = document.getElementById('stockBajoList');
    var emptyMsg = document.getElementById('emptyStockBajo');

    var stockBajo = productos.filter(function(p) {
        return p.stock <= (p.stockMinimo || 5);
    });

    if (stockBajo.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    container.innerHTML = stockBajo.map(function(p) {
        return '<div class="stock-item">' +
            '<span class="stock-item-name">' + escapeHTML(p.nombre) + '</span>' +
            '<span class="stock-item-qty">' + p.stock + ' unid.</span>' +
        '</div>';
    }).join('');
}

// ==================== HISTORIAL ====================
/**
 * Actualiza la vista del historial de transacciones
 */
function actualizarHistorial() {
    var tipo = document.getElementById('filtroTipo').value;
    var desde = document.getElementById('filtroDesde').value;
    var hasta = document.getElementById('filtroHasta').value;

    var transacciones = [];

    // Agregar ventas al historial
    if (tipo === 'todos' || tipo === 'venta') {
        ventas.forEach(function(v) {
            transacciones.push({
                fecha: v.fecha,
                tipo: 'venta',
                descripcion: v.productoNombre + ' (x' + v.cantidad + ')',
                monto: v.total
            });
        });
    }

    // Agregar gastos al historial
    if (tipo === 'todos' || tipo === 'gasto') {
        gastos.forEach(function(g) {
            transacciones.push({
                fecha: g.fecha,
                tipo: 'gasto',
                descripcion: g.descripcion + ' (' + g.categoria + ')',
                monto: g.monto
            });
        });
    }

    // Filtrar por rango de fechas
    if (desde) {
        transacciones = transacciones.filter(function(t) { return t.fecha >= desde; });
    }
    if (hasta) {
        transacciones = transacciones.filter(function(t) { return t.fecha <= hasta; });
    }

    // Ordenar por fecha descendente
    transacciones.sort(function(a, b) { return b.fecha.localeCompare(a.fecha); });

    // Renderizar
    var tbody = document.getElementById('historialTable');
    var emptyMsg = document.getElementById('emptyHistorial');

    if (transacciones.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    tbody.innerHTML = transacciones.map(function(t) {
        var tipoBadge = t.tipo === 'venta' 
            ? '<span class="badge badge-venta">Venta</span>' 
            : '<span class="badge badge-gasto">Gasto</span>';
        var montoClass = t.tipo === 'venta' ? 'positive' : 'negative';
        var signo = t.tipo === 'venta' ? '+' : '-';

        return '<tr>' +
            '<td>' + formatearFecha(t.fecha) + '</td>' +
            '<td>' + tipoBadge + '</td>' +
            '<td>' + escapeHTML(t.descripcion) + '</td>' +
            '<td><span class="profit-value ' + montoClass + '">' + signo + '$' + t.monto.toFixed(2) + '</span></td>' +
        '</tr>';
    }).join('');
}

/**
 * Configura los filtros del historial
 */
function configurarFiltros() {
    document.getElementById('btnFiltrar').addEventListener('click', function() {
        actualizarHistorial();
    });
}

// ==================== REPORTES ====================
/**
 * Actualiza todas las estadísticas de la sección de reportes
 */
function actualizarReportes() {
    var ahora = new Date();
    var hoy = ahora.toISOString().split('T')[0];
    
    // Primer día de la semana (lunes)
    var diaSemana = ahora.getDay();
    var diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    var lunes = new Date(ahora);
    lunes.setDate(ahora.getDate() - diffLunes);
    var primerDiaSemana = lunes.toISOString().split('T')[0];
    
    // Primer día del mes
    var primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];

    // Ventas de hoy
    var ventasHoy = ventas
        .filter(function(v) { return v.fecha === hoy; })
        .reduce(function(sum, v) { return sum + v.total; }, 0);

    // Ventas de la semana
    var ventasSemana = ventas
        .filter(function(v) { return v.fecha >= primerDiaSemana; })
        .reduce(function(sum, v) { return sum + v.total; }, 0);

    // Ventas del mes
    var ventasMes = ventas
        .filter(function(v) { return v.fecha >= primerDiaMes; })
        .reduce(function(sum, v) { return sum + v.total; }, 0);

    // Gastos del mes
    var gastosMesTotal = gastos
        .filter(function(g) { return g.fecha >= primerDiaMes; })
        .reduce(function(sum, g) { return sum + g.monto; }, 0);

    var gananciaNeta = ventasMes - gastosMesTotal;

    // Actualizar elementos
    document.getElementById('repVentasHoy').textContent = '$' + ventasHoy.toFixed(2);
    document.getElementById('repVentasSemana').textContent = '$' + ventasSemana.toFixed(2);
    document.getElementById('repVentasMes').textContent = '$' + ventasMes.toFixed(2);
    document.getElementById('repGastosMes').textContent = '$' + gastosMesTotal.toFixed(2);
    document.getElementById('repTotalIngresos').textContent = '$' + ventasMes.toFixed(2);
    document.getElementById('repTotalGastos').textContent = '$' + gastosMesTotal.toFixed(2);
    
    var gananciaEl = document.getElementById('repGananciaNeta');
    gananciaEl.textContent = '$' + gananciaNeta.toFixed(2);
    gananciaEl.className = 'profit-value ' + (gananciaNeta >= 0 ? 'positive' : 'negative');

    // Top productos más vendidos
    renderizarTopProductos();
    
    // Top clientes
    renderizarTopClientes();
}

/**
 * Muestra los productos más vendidos
 */
function renderizarTopProductos() {
    var container = document.getElementById('topProductos');
    var emptyMsg = document.getElementById('emptyTopProd');

    // Agrupar ventas por producto
    var productosVendidos = {};
    ventas.forEach(function(v) {
        if (!productosVendidos[v.productoNombre]) {
            productosVendidos[v.productoNombre] = { nombre: v.productoNombre, cantidad: 0, total: 0 };
        }
        productosVendidos[v.productoNombre].cantidad += v.cantidad;
        productosVendidos[v.productoNombre].total += v.total;
    });

    // Convertir a array y ordenar
    var top = Object.values(productosVendidos)
        .sort(function(a, b) { return b.total - a.total; })
        .slice(0, 5);

    if (top.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    container.innerHTML = top.map(function(p, i) {
        return '<div class="top-item">' +
            '<div class="top-item-info">' +
                '<span class="top-item-rank">' + (i + 1) + '</span>' +
                '<span class="top-item-name">' + escapeHTML(p.nombre) + ' (' + p.cantidad + ' unid.)</span>' +
            '</div>' +
            '<span class="top-item-value">$' + p.total.toFixed(2) + '</span>' +
        '</div>';
    }).join('');
}

/**
 * Muestra los mejores clientes por monto de compras
 */
function renderizarTopClientes() {
    var container = document.getElementById('topClientes');
    var emptyMsg = document.getElementById('emptyTopCli');

    var clientesConCompras = clientes
        .filter(function(c) { return (c.compras || 0) > 0; })
        .sort(function(a, b) { return (b.totalGastado || 0) - (a.totalGastado || 0); })
        .slice(0, 5);

    if (clientesConCompras.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    container.innerHTML = clientesConCompras.map(function(c, i) {
        return '<div class="top-item">' +
            '<div class="top-item-info">' +
                '<span class="top-item-rank">' + (i + 1) + '</span>' +
                '<span class="top-item-name">' + escapeHTML(c.nombre) + ' (' + (c.compras || 0) + ' compras)</span>' +
            '</div>' +
            '<span class="top-item-value">$' + (c.totalGastado || 0).toFixed(2) + '</span>' +
        '</div>';
    }).join('');
}

// ==================== BÚSQUEDAS ====================
/**
 * Configura los campos de búsqueda en tiempo real
 */
function configurarBusquedas() {
    document.getElementById('buscarProducto').addEventListener('input', function() {
        renderizarProductos();
    });

    document.getElementById('buscarCliente').addEventListener('input', function() {
        renderizarClientes();
    });
}

// ==================== MODAL ====================
/**
 * Configura los eventos del modal de confirmación
 */
function configurarModal() {
    document.getElementById('modalClose').addEventListener('click', cerrarModal);
    document.getElementById('modalCancel').addEventListener('click', cerrarModal);
    document.getElementById('modalConfirm').addEventListener('click', function() {
        if (modalCallback) modalCallback();
        cerrarModal();
    });
}

/**
 * Muestra el modal de confirmación
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje a mostrar
 * @param {Function} callback - Función a ejecutar si el usuario confirma
 */
function mostrarModal(titulo, mensaje, callback) {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalMessage').textContent = mensaje;
    document.getElementById('modalOverlay').classList.add('show');
    modalCallback = callback;
}

/**
 * Cierra el modal de confirmación
 */
function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    modalCallback = null;
}

// ==================== TOAST / NOTIFICACIONES ====================
/**
 * Muestra una notificación tipo toast
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipo - Tipo: 'success', 'error', 'warning', 'info'
 */
function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    var container = document.getElementById('toastContainer');
    
    var iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + tipo;
    toast.innerHTML = '<i class="fas ' + iconos[tipo] + '"></i> ' + mensaje;
    
    container.appendChild(toast);

    // Remover el toast después de 3 segundos
    setTimeout(function() {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// ==================== UTILIDADES ====================
/**
 * Formatea una fecha ISO a formato legible
 * @param {string} fechaISO - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada (ej: "15 Ene 2025")
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return '-';
    var partes = fechaISO.split('-');
    var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return parseInt(partes[2]) + ' ' + meses[parseInt(partes[1]) - 1] + ' ' + partes[0];
}

/**
 * Escapa caracteres HTML para prevenir inyección XSS
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto seguro
 */
function escapeHTML(texto) {
    if (!texto) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
}

/**
 * Formatea un número como moneda
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado (ej: "$1,234.56")
 */
function formatearMoneda(numero) {
    return '$' + numero.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
