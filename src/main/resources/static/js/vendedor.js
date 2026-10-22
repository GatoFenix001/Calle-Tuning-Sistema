"use strict";
const $v = id => document.getElementById(id);
function tokenCsrf() { const c = document.cookie.split(";").map(x => x.trim()).find(x => x.startsWith("XSRF-TOKEN=")); return c ? decodeURIComponent(c.slice(11)) : ""; }
async function seguro(url, options = {}) { const h = { Accept: "application/json", ...(options.headers || {}) }; const t = tokenCsrf(); if (t) h["X-XSRF-TOKEN"] = t; return fetch(url, { credentials: "same-origin", ...options, headers: h }); }
async function cargarOrdenes() { const body = $v("ordenes"); try { const r = await seguro("/api/servicios-taller"); if (!r.ok) throw new Error("No se pudieron consultar las órdenes."); const data = await r.json(); body.replaceChildren(); if (!data.length) { body.innerHTML = '<tr><td colspan="7">Todavía no hay órdenes registradas.</td></tr>'; return; } data.forEach(o => { const tr = document.createElement("tr");[o.id, o.cliente, o.vehiculo, o.tipoServicio, o.vendedorUsername, new Date(o.fechaCreacion).toLocaleString("es-PE")].forEach(v => { const td = document.createElement("td"); td.textContent = v ?? ""; tr.appendChild(td) }); const td = document.createElement("td"), sel = document.createElement("select"); sel.className = "status-select";["PENDIENTE", "EN_PROCESO", "FINALIZADO", "CANCELADO"].forEach(st => { const op = document.createElement("option"); op.value = st; op.textContent = st.replace("_", " "); op.selected = st === o.estado; sel.appendChild(op) }); sel.addEventListener("change", async () => { const rr = await seguro(`/api/servicios-taller/${o.id}/estado`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: sel.value }) }); if (!rr.ok) { $v("mensaje").textContent = "No se pudo actualizar el estado."; cargarOrdenes(); } }); td.appendChild(sel); tr.appendChild(td); body.appendChild(tr); }); } catch (e) { body.innerHTML = '<tr><td colspan="7">No se pudo cargar la información. Comprueba la conexión.</td></tr>'; } }
$v("formServicio").addEventListener("submit", async e => { e.preventDefault(); const form = e.currentTarget, btn = form.querySelector("button[type=submit]"); btn.disabled = true; $v("mensaje").textContent = ""; const d = new FormData(form); try { const r = await seguro("/api/servicios-taller", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cliente: String(d.get("cliente")).trim(), vehiculo: String(d.get("vehiculo")).trim(), tipoServicio: d.get("tipoServicio"), descripcion: String(d.get("descripcion") || "").trim() }) }); if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.detail || b.message || "No se pudo registrar la orden."); } $v("mensaje").textContent = "Orden registrada correctamente."; form.reset(); await cargarOrdenes(); } catch (err) { $v("mensaje").textContent = err.message || "Error de conexión."; } finally { btn.disabled = false; } });
$v("salir").addEventListener("click", async () => { await seguro("/logout", { method: "POST" }); location.href = "/tienda.html"; });
cargarOrdenes();

// Navegación y módulos de solo lectura para el vendedor.
document.querySelectorAll('[data-seccion]').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('[data-seccion]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); document.getElementById(btn.dataset.seccion)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
function celda(v) { const td = document.createElement('td'); td.textContent = (v === null || v === undefined) ? '' : String(v); return td; }
async function cargarTabla(url, id, cols) { const tbody = $v(id); try { const r = await seguro(url); if (!r.ok) throw new Error(); const data = await r.json(); tbody.replaceChildren(); if (!Array.isArray(data) || !data.length) { const tr = document.createElement('tr'), td = celda('Sin registros'); td.colSpan = cols.length; tr.appendChild(td); tbody.appendChild(tr); return 0; } data.forEach(o => { const tr = document.createElement('tr'); cols.forEach(c => tr.appendChild(celda(c(o)))); tbody.appendChild(tr) }); return data.length; } catch (e) { tbody.replaceChildren(); const tr = document.createElement('tr'), td = celda('No se pudo cargar la información. Verifica permisos y conexión.'); td.colSpan = cols.length; tr.appendChild(td); tbody.appendChild(tr); return null; } }
async function cargarConsultasVendedor() { const [p, c, v, d] = await Promise.all([cargarTabla('/api/productos', 'tablaProductos', [o => o.id, o => o.nombre, o => o.precio, o => o.stock]), cargarTabla('/api/clientes', 'tablaClientes', [o => o.id, o => [o.nombre, o.apellido].filter(Boolean).join(' '), o => o.documento || o.dni || '', o => o.email || o.correo || '']), cargarTabla('/api/ventas', 'tablaVentas', [o => o.id, o => o.fecha || o.fechaVenta || '', o => o.total || o.totalVenta || '', o => o.estado || 'Registrada']), cargarTabla('/api/detalles-venta', 'tablaDetalles', [o => o.id, o => o.venta?.id || o.ventaId || '', o => o.producto?.nombre || o.productoNombre || '', o => o.cantidad, o => o.subtotal || ''])]); if ($v('totalProductosV')) $v('totalProductosV').textContent = p ?? '—'; if ($v('totalClientesV')) $v('totalClientesV').textContent = c ?? '—'; if ($v('totalVentasV')) $v('totalVentasV').textContent = v ?? '—'; }
cargarConsultasVendedor();
(function () {
    const vistas = [
        "dashboard",
        "productos",
        "clientes",
        "ventas",
        "detalles",
        "servicios"
    ];

    const titulos = {
        dashboard: "Dashboard",
        productos: "Productos",
        clientes: "Clientes",
        ventas: "Ventas",
        detalles: "Detalles de venta",
        servicios: "Servicios de taller"
    };

    function mostrarVistaVendedor(nombreVista) {
        if (!vistas.includes(nombreVista)) {
            return;
        }

        // Ocultar todas las vistas
        vistas.forEach(function (id) {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.classList.remove("vista-activa");
            }
        });

        // Mostrar únicamente la vista seleccionada
        const vistaSeleccionada =
            document.getElementById(nombreVista);

        if (vistaSeleccionada) {
            vistaSeleccionada.classList.add("vista-activa");
        }

        // Actualizar el botón activo del menú
        document.querySelectorAll(".nav button[data-seccion]")
            .forEach(function (boton) {
                const activo =
                    boton.dataset.seccion === nombreVista;

                boton.classList.toggle("active", activo);
            });

        // Actualizar el título de la barra superior
        const titulo = document.querySelector(".topbar-title h2");

        if (titulo) {
            titulo.textContent = titulos[nombreVista];
        }
    }

    // Configurar los botones de navegación
    document.querySelectorAll(".nav button[data-seccion]")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                mostrarVistaVendedor(boton.dataset.seccion);
            });
        });

    // Mostrar el Dashboard al entrar
    mostrarVistaVendedor("dashboard");
})();