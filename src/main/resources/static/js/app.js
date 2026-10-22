
"use strict";

/* =========================================================
   CALLE TUNING
   Control principal de la interfaz y operaciones CRUD
   Requiere js/api.js cargado previamente
   ========================================================= */

let currentModule = "dashboard";
let editingId = null;
let currentData = [];

/* ===================== CONFIGURACIÓN ===================== */

const configs = window.CalleTuningModules;

/* ===================== UTILIDADES ===================== */

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function getRelationValue(value) {
    if (!value) return "—";

    if (typeof value === "object") {
        return escapeHtml(value.nombre || value.username || value.id || "—");
    }

    return escapeHtml(value);
}

function relationId(value) {
    if (value && typeof value === "object") {
        return value.id ?? "";
    }

    return value ?? "";
}

function formatDateTime(value) {
    if (!value) return "";

    // Convierte fechas ISO para controles datetime-local.
    return String(value).slice(0, 16);
}

function mostrarError(error, mensaje) {
    console.error(mensaje, error);
    toast(mensaje + ": " + (error.message || "Error desconocido"), true);
}

/* ===================== NAVEGACIÓN ===================== */

function mostrarModulo(module) {
    if (module === "dashboard") {
        currentModule = "dashboard";

        document.querySelectorAll(".nav button")
            .forEach(button => button.classList.remove("active"));

        const boton = document.querySelector(
            '.nav button[data-module="dashboard"]'
        );

        if (boton) boton.classList.add("active");

        document.getElementById("topTitle").textContent = "Dashboard";
        renderDashboard();
        return;
    }

    if (!configs[module]) {
        toast("El módulo solicitado no existe.", true);
        return;
    }

    currentModule = module;

    document.querySelectorAll(".nav button")
        .forEach(button => button.classList.remove("active"));

    const boton = document.querySelector(
        `.nav button[data-module="${module}"]`
    );

    if (boton) boton.classList.add("active");

    document.getElementById("topTitle").textContent = configs[module].title;

    cargarModulo(module);
}

/* ===================== DASHBOARD ===================== */

function renderDashboard() {
    return window.CalleTuningDashboard.render();
}

/* ===================== CARGAR MÓDULOS ===================== */

async function cargarModulo(module) {
    const cfg = configs[module];

    if (!cfg) {
        toast("No se encontró la configuración del módulo.", true);
        return;
    }

    currentModule = module;

    const content = document.getElementById("appContent");

    content.innerHTML = `
        <div class="module-head">
            <div class="module-title">
                <h2>${escapeHtml(cfg.title)}</h2>
                <p>Administración y mantenimiento de ${escapeHtml(cfg.singular)}.</p>
            </div>

            <div class="actions">
                <button class="btn btn-dark"
                    onclick="cargarModulo('${module}')">
                    Actualizar
                </button>

                <button class="btn btn-primary" onclick="abrirNuevo()">
                    + Añadir ${escapeHtml(cfg.singular)}
                </button>
            </div>
        </div>

        <div class="panel">
            <div class="panel-body">
                <div class="search">
                    <input id="searchInput"
                        placeholder="Buscar en ${escapeHtml(cfg.title.toLowerCase())}..."
                        oninput="filtrarTabla()">
                </div>

                <div class="table-wrap" id="tableArea">
                    <div class="empty">Cargando datos...</div>
                </div>
            </div>
        </div>
    `;

    try {
        currentData = await getJSON(API + "/" + cfg.endpoint);

        // Evita renderizar una respuesta atrasada en otro módulo.
        if (currentModule !== module) return;

        renderTable(currentData);

    } catch (error) {
        const area = document.getElementById("tableArea");

        if (area && currentModule === module) {
            area.innerHTML = `
                <div class="empty">
                    <strong>No se pudo cargar la información</strong>
                    Comprueba la conexión y los permisos de acceso.
                </div>
            `;
        }

        mostrarError(error, "Error al cargar " + cfg.title);
    }
}

/* ===================== TABLAS ===================== */

function cellValue(item, key) {
    const value = item[key];

    const relaciones = [
        "cliente", "usuario", "rol", "categoria",
        "marca", "proveedor", "venta", "producto"
    ];

    if (relaciones.includes(key)) {
        return getRelationValue(value);
    }

    if (key === "estado") {
        return value
            ? '<span class="badge badge-red">ACTIVO</span>'
            : '<span class="badge badge-black">INACTIVO</span>';
    }

    if (key === "tipoMovimiento") {
        return value === "ENTRADA"
            ? '<span class="badge badge-red">ENTRADA</span>'
            : '<span class="badge badge-black">SALIDA</span>';
    }

    if (["precio", "total", "precioUnitario", "subtotal"].includes(key)) {
        return value == null ? "—" : "S/ " + Number(value).toFixed(2);
    }

    if (key === "fecha" && value) {
        return escapeHtml(String(value).replace("T", " "));
    }

    return value == null || value === ""
        ? "—"
        : escapeHtml(value);
}

function columnTitle(key) {
    const titles = {
        id: "ID",
        nombre: "Nombre",
        apellido: "Apellido",
        username: "Usuario",
        precio: "Precio",
        stock: "Stock",
        stockMinimo: "Stock mínimo",
        estado: "Estado",
        descripcion: "Descripción",
        telefono: "Teléfono",
        email: "Correo",
        direccion: "Dirección",
        documento: "Documento",
        fecha: "Fecha",
        total: "Total",
        cantidad: "Cantidad",
        precioUnitario: "Precio unitario",
        subtotal: "Subtotal",
        tipoMovimiento: "Tipo",
        motivo: "Motivo",
        cliente: "Cliente",
        usuario: "Usuario",
        rol: "Rol",
        categoria: "Categoría",
        marca: "Marca",
        proveedor: "Proveedor",
        venta: "Venta",
        producto: "Producto"
    };

    return titles[key] || key;
}

function renderTable(data) {
    const cfg = configs[currentModule];
    const area = document.getElementById("tableArea");

    if (!area) return;

    if (!Array.isArray(data) || data.length === 0) {
        area.innerHTML = `
            <div class="empty">
                <strong>No hay registros</strong>
                Agrega el primer registro usando el botón Añadir.
            </div>
        `;
        return;
    }

    area.innerHTML = `
        <table>
            <thead>
                <tr>
                    ${cfg.columns.map(column =>
                        `<th>${escapeHtml(columnTitle(column))}</th>`
                    ).join("")}
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                ${data.map(item => `
                    <tr data-search="${escapeHtml(JSON.stringify(item))}">
                        ${cfg.columns.map(column =>
                            `<td>${cellValue(item, column)}</td>`
                        ).join("")}

                        <td>
                            <div class="row-actions">
                                <button class="edit-btn"
                                    onclick="editar(${Number(item.id)})">
                                    Editar
                                </button>

                                <button class="delete-btn"
                                    onclick="eliminar(${Number(item.id)})">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function filtrarTabla() {
    const query = (
        document.getElementById("searchInput")?.value || ""
    ).toLowerCase();

    document.querySelectorAll("#tableArea tbody tr").forEach(row => {
        row.style.display = row.dataset.search.toLowerCase().includes(query)
            ? ""
            : "none";
    });
}

/* ===================== FORMULARIOS ===================== */

async function abrirNuevo() {
    editingId = null;
    await abrirFormulario(null);
}

async function editar(id) {
    try {
        const cfg = configs[currentModule];
        const item = await getJSON(API + "/" + cfg.endpoint + "/" + id);

        editingId = id;
        await abrirFormulario(item);

    } catch (error) {
        mostrarError(error, "No se pudo obtener el registro");
    }
}

async function abrirFormulario(item) {
    const cfg = configs[currentModule];

    document.getElementById("modalTitle").textContent =
        editingId ? "Editar " + cfg.singular : "Nuevo " + cfg.singular;

    let html = '<div class="form-grid">';

    for (const field of cfg.fields) {
        const [key, label, type, required, extra] = field;

        // En edición, la contraseña vacía significa no cambiarla.
        let value = item ? item[key] : "";

        if (type === "relation") value = relationId(value);
        if (type === "datetime-local") value = formatDateTime(value);

        const obligatorio = required ? "required" : "";
        const esContrasena = key === "password";

        html += `
            <div class="field ${type === "textarea" ? "full" : ""}">
                <label for="field-${key}">${escapeHtml(label)}</label>
        `;

        if (type === "image") {
            html += `
                <input id="field-${key}" name="${key}" type="file" accept="image/png,image/jpeg,image/webp" ${obligatorio}>
                <small>Formatos: JPG, PNG o WEBP. Máximo 2 MB.</small>
                ${value ? `<img src="${escapeHtml(value)}" alt="Imagen actual" style="display:block;max-width:160px;max-height:120px;object-fit:contain;margin-top:8px">` : ""}
            `;
        } else if (type === "textarea") {
            html += `
                <textarea id="field-${key}" name="${key}" ${obligatorio}>${escapeHtml(value)}</textarea>
            `;

        } else if (type === "select") {
            html += `
                <select id="field-${key}" name="${key}" ${obligatorio}>
                    ${extra.map(option => `
                        <option value="${escapeHtml(option[0])}"
                            ${String(value) === option[0] ? "selected" : ""}>
                            ${escapeHtml(option[1])}
                        </option>
                    `).join("")}
                </select>
            `;

        } else if (type === "relation") {
            html += `
                <select id="field-${key}" name="${key}"
                    data-relation="${escapeHtml(extra)}" ${obligatorio}>
                    <option value="">Cargando...</option>
                </select>
            `;

        } else {
            html += `
                <input
                    id="field-${key}"
                    name="${key}"
                    type="${type}"
                    value="${esContrasena ? "" : escapeHtml(value)}"
                    ${esContrasena ? "" : obligatorio}
                    ${esContrasena && editingId
                        ? 'placeholder="Dejar vacío para conservar la contraseña"'
                        : ""}
                    ${type === "number" ? 'step="0.01"' : ""}
                >
            `;
        }

        html += "</div>";
    }

    html += `
        </div>
        <div class="form-footer">
            <button type="button" class="btn btn-light"
                onclick="cerrarModal()">
                Cancelar
            </button>

            <button type="submit" class="btn btn-primary">
                ${editingId ? "Guardar cambios" : "Registrar"}
            </button>
        </div>
    `;

    const form = document.getElementById("dataForm");
    form.innerHTML = html;

    document.getElementById("modal").classList.add("show");

    for (const select of form.querySelectorAll("select[data-relation]")) {
        await cargarRelacion(select, select.dataset.relation);

        if (item) {
            select.value = relationId(item[select.name]);
        }
    }

    form.onsubmit = guardarFormulario;
}

async function cargarRelacion(select, endpoint) {
    try {
        const data = await getJSON(API + "/" + endpoint);

        select.innerHTML = '<option value="">Seleccione...</option>' +
            data.map(item => {
                const text = item.nombre || item.username || ("ID " + item.id);

                return `
                    <option value="${Number(item.id)}">
                        ${escapeHtml(text)}
                    </option>
                `;
            }).join("");

    } catch (error) {
        console.error("Error al cargar relación:", error);
        select.innerHTML = '<option value="">No disponible</option>';
    }
}

/* ===================== CREAR Y ACTUALIZAR ===================== */

async function guardarFormulario(event) {
    event.preventDefault();

    const cfg = configs[currentModule];
    const form = new FormData(event.target);
    const body = {};

    for (const field of cfg.fields) {
        const [key, label, type] = field;
        let value = form.get(key);

        if (type === "image") {
            const file = value;
            if (file && file.size > 0) {
                if (file.size > 2 * 1024 * 1024) {
                    mostrarToast("La imagen no debe superar los 2 MB", "error");
                    return;
                }
                if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
                    mostrarToast("Selecciona una imagen JPG, PNG o WEBP", "error");
                    return;
                }
                value = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
                    reader.readAsDataURL(file);
                });
                body[key] = value;
            } else if (editingId) {
                continue; // conservar imagen existente si no se selecciona otra
            } else {
                body[key] = null;
            }
            continue;
        }

        if (key === "password" && editingId && !value) {
            // El servicio debe conservar la contraseña si no se envía.
            continue;
        }

        if (type === "number") {
            value = value === "" ? null : Number(value);

        } else if (
            type === "select" &&
            (value === "true" || value === "false")
        ) {
            value = value === "true";

        } else if (type === "relation") {
            value = value === "" ? null : { id: Number(value) };
        }

        body[key] = value;
    }

    try {
        const url = API + "/" + cfg.endpoint +
            (editingId ? "/" + editingId : "");

        const response = await fetchSeguro(url, {
            method: editingId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const mensaje = await response.text();
            throw new Error(mensaje || "Error HTTP " + response.status);
        }

        cerrarModal();
        toast(editingId
            ? "Registro actualizado correctamente"
            : "Registro creado correctamente");

        await cargarModulo(currentModule);

    } catch (error) {
        mostrarError(error, "Error al guardar");
    }
}

/* ===================== ELIMINAR ===================== */

async function eliminar(id) {
    const cfg = configs[currentModule];

    if (!confirm(
        `¿Eliminar este ${cfg.singular}? Esta acción no se puede deshacer.`
    )) {
        return;
    }

    try {
        const response = await fetchSeguro(
            API + "/" + cfg.endpoint + "/" + id,
            { method: "DELETE" }
        );

        if (!response.ok) {
            const mensaje = await response.text();
            throw new Error(mensaje || "Error HTTP " + response.status);
        }

        toast("Registro eliminado correctamente");
        await cargarModulo(currentModule);

    } catch (error) {
        mostrarError(
            error,
            "No se pudo eliminar. Puede tener relaciones asociadas"
        );
    }
}

/* ===================== MODAL Y NOTIFICACIONES ===================== */

function cerrarModal() {
    document.getElementById("modal").classList.remove("show");
    editingId = null;
}

function toast(message, error = false) {
    const element = document.getElementById("toast");

    element.textContent = message;
    element.className = "toast show" + (error ? " error" : "");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        element.classList.remove("show");
    }, 3500);
}

/* ===================== INICIALIZACIÓN ===================== */

document.getElementById("modal").addEventListener("click", event => {
    if (event.target.id === "modal") {
        cerrarModal();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();
});
