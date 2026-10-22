
"use strict";

document.addEventListener("DOMContentLoaded", iniciarTienda);

const API_PRODUCTOS = "/api/productos";

let productosDisponibles = [];
let carrito = new Map();

const elementos = {};

function iniciarTienda() {
    elementos.catalogo = document.getElementById("catalogoProductos");
    elementos.estado = document.getElementById("estadoCatalogo");
    elementos.total = document.getElementById("totalProductos");
    elementos.buscar = document.getElementById("buscarProducto");
    elementos.categoria = document.getElementById("filtroCategoria");
    elementos.btnCarrito = document.getElementById("btnCarrito");
    elementos.cerrarCarrito = document.getElementById("cerrarCarrito");
    elementos.fondoCarrito = document.getElementById("fondoCarrito");
    elementos.panelCarrito = document.getElementById("panelCarrito");
    elementos.contadorCarrito = document.getElementById("contadorCarrito");
    elementos.listaCarrito = document.getElementById("listaCarrito");
    elementos.subtotal = document.getElementById("subtotalCarrito");
    elementos.btnContinuar = document.getElementById("btnContinuarCompra");
    elementos.mensajeCarrito = document.getElementById("mensajeCarrito");

    document.getElementById("anioActual").textContent =
        new Date().getFullYear();

    elementos.buscar.addEventListener("input", mostrarProductos);
    elementos.categoria.addEventListener("change", mostrarProductos);

    elementos.btnCarrito.addEventListener("click", abrirCarrito);
    elementos.cerrarCarrito.addEventListener("click", cerrarCarrito);
    elementos.fondoCarrito.addEventListener("click", cerrarCarrito);

    elementos.btnContinuar.addEventListener("click", continuarCompra);

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            cerrarCarrito();
        }
    });

    cargarProductos();
}

async function cargarProductos() {
    elementos.estado.textContent = "Consultando productos del inventario...";
    elementos.total.textContent = "Cargando...";

    try {
        const respuesta = await fetch(API_PRODUCTOS, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "same-origin"
        });

        if (!respuesta.ok) {
            if (respuesta.redirected) {
                throw new Error(
                    "La sesión puede haber expirado o necesitas iniciar sesión para consultar el catálogo."
                );
            }

            if (respuesta.status === 401 || respuesta.status === 403) {
                throw new Error(
                    "No tienes acceso al catálogo. Inicia sesión con un usuario autorizado."
                );
            }

            throw new Error(
                `No se pudieron consultar los productos (HTTP ${respuesta.status}).`
            );
        }

        const tipoContenido = respuesta.headers.get("content-type") || "";

        if (!tipoContenido.includes("application/json")) {
            throw new Error(
                "El servidor no devolvió JSON. Comprueba si te redirigió al inicio de sesión."
            );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de productos válida.");
        }

        productosDisponibles = datos.filter((producto) =>
            producto &&
            producto.id != null &&
            producto.estado === true
        );

        prepararCategorias();
        mostrarProductos();
        restaurarCarrito();
        actualizarCarrito();

    } catch (error) {
        console.error("Error al cargar el catálogo:", error);

        elementos.catalogo.replaceChildren();
        elementos.total.textContent = "Catálogo no disponible";
        elementos.estado.textContent =
            error.message ||
            "No fue posible conectar con el inventario. Inténtalo nuevamente.";

        const botonReintentar = document.createElement("button");
        botonReintentar.type = "button";
        botonReintentar.className = "boton-principal";
        botonReintentar.textContent = "Reintentar";
        botonReintentar.addEventListener("click", cargarProductos);

        elementos.estado.appendChild(document.createElement("br"));
        elementos.estado.appendChild(botonReintentar);
    }
}

function prepararCategorias() {
    const categorias = new Map();

    productosDisponibles.forEach((producto) => {
        const nombre = obtenerNombreCategoria(producto);

        if (nombre) {
            categorias.set(normalizar(nombre), nombre);
        }
    });

    const categoriaSeleccionada = elementos.categoria.value;

    elementos.categoria.replaceChildren();

    const opcionTodas = document.createElement("option");
    opcionTodas.value = "";
    opcionTodas.textContent = "Todas las categorías";
    elementos.categoria.appendChild(opcionTodas);

    [...categorias.values()]
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach((nombre) => {
            const opcion = document.createElement("option");
            opcion.value = normalizar(nombre);
            opcion.textContent = nombre;
            elementos.categoria.appendChild(opcion);
        });

    elementos.categoria.value = categorias.has(
        normalizar(categoriaSeleccionada)
    ) ? normalizar(categoriaSeleccionada) : categoriaSeleccionada;
}

function mostrarProductos() {
    const busqueda = normalizar(elementos.buscar.value.trim());
    const categoriaSeleccionada = elementos.categoria.value;

    const filtrados = productosDisponibles.filter((producto) => {
        const nombre = normalizar(producto.nombre);
        const descripcion = normalizar(producto.descripcion || "");
        const marca = normalizar(obtenerNombreMarca(producto));
        const categoria = normalizar(obtenerNombreCategoria(producto));

        const coincideBusqueda =
            !busqueda ||
            nombre.includes(busqueda) ||
            descripcion.includes(busqueda) ||
            marca.includes(busqueda) ||
            categoria.includes(busqueda);

        const coincideCategoria =
            !categoriaSeleccionada ||
            categoria === categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
    });

    elementos.catalogo.replaceChildren();

    elementos.total.textContent =
        `${filtrados.length} producto${filtrados.length === 1 ? "" : "s"}`;

    if (productosDisponibles.length === 0) {
        elementos.estado.textContent =
            "No hay productos activos disponibles en el catálogo.";
        return;
    }

    if (filtrados.length === 0) {
        elementos.estado.textContent =
            "No encontramos productos que coincidan con tu búsqueda.";
        return;
    }

    elementos.estado.textContent = "";

    filtrados.forEach((producto) => {
        elementos.catalogo.appendChild(crearTarjetaProducto(producto));
    });
}

function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";

    const visual = document.createElement("div");
    visual.className = "producto-visual";

    const iniciales = document.createElement("span");
    iniciales.className = "producto-iniciales";
    iniciales.setAttribute("aria-hidden", "true");
    iniciales.textContent = obtenerIniciales(producto.nombre);

    const categoria = document.createElement("span");
    categoria.className = "producto-categoria";
    categoria.textContent = obtenerNombreCategoria(producto) || "Producto";

    if (typeof producto.imagen === "string" && producto.imagen.startsWith("data:image/")) {
        const imagen = document.createElement("img");
        imagen.className = "producto-imagen";
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre || "Imagen del producto";
        imagen.loading = "lazy";
        visual.append(imagen);
    } else {
        visual.append(iniciales);
    }
    visual.append(categoria);

    const contenido = document.createElement("div");
    contenido.className = "producto-contenido";

    const marca = document.createElement("span");
    marca.className = "producto-marca";
    marca.textContent = obtenerNombreMarca(producto) || "CALLE TUNING";

    const nombre = document.createElement("h3");
    nombre.className = "producto-nombre";
    nombre.textContent = producto.nombre || "Producto sin nombre";

    const descripcion = document.createElement("p");
    descripcion.className = "producto-descripcion";
    descripcion.textContent =
        producto.descripcion || "Producto disponible en nuestro catálogo.";

    const disponibilidad = document.createElement("p");
    disponibilidad.className = "producto-disponibilidad";

    const stock = obtenerStock(producto);
    const hayStock = stock > 0;

    disponibilidad.classList.toggle("sin-stock", !hayStock);
    disponibilidad.textContent = hayStock
        ? `Disponible: ${stock} unidad${stock === 1 ? "" : "es"}`
        : "Agotado";

    const pie = document.createElement("div");
    pie.className = "producto-pie";

    const precio = document.createElement("span");
    precio.className = "producto-precio";
    precio.textContent = formatearPrecio(producto.precio);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-agregar";
    boton.textContent = hayStock ? "Agregar +" : "Agotado";
    boton.disabled = !hayStock;
    boton.setAttribute(
        "aria-label",
        `Agregar ${producto.nombre || "producto"} al carrito`
    );

    boton.addEventListener("click", () => agregarAlCarrito(producto.id));

    pie.append(precio, boton);
    contenido.append(marca, nombre, descripcion, disponibilidad, pie);
    tarjeta.append(visual, contenido);

    return tarjeta;
}

function agregarAlCarrito(id) {
    const producto = productosDisponibles.find(
        (item) => String(item.id) === String(id)
    );

    if (!producto) {
        mostrarMensajeCarrito("El producto ya no está disponible en el catálogo.");
        return;
    }

    const stock = obtenerStock(producto);
    const itemActual = carrito.get(String(id));
    const cantidadActual = itemActual ? itemActual.cantidad : 0;

    if (cantidadActual >= stock) {
        mostrarMensajeCarrito(
            `Solo hay ${stock} unidad${stock === 1 ? "" : "es"} disponible${stock === 1 ? "" : "s"}.`
        );
        abrirCarrito();
        return;
    }

    carrito.set(String(id), {
        producto,
        cantidad: cantidadActual + 1
    });

    actualizarCarrito();
    mostrarMensajeCarrito("Producto agregado al carrito.");
}

function cambiarCantidad(id, cambio) {
    const clave = String(id);
    const item = carrito.get(clave);

    if (!item) {
        return;
    }

    const nuevaCantidad = item.cantidad + cambio;
    const stock = obtenerStock(item.producto);

    if (nuevaCantidad <= 0) {
        carrito.delete(clave);
    } else if (nuevaCantidad <= stock) {
        item.cantidad = nuevaCantidad;
        carrito.set(clave, item);
    } else {
        mostrarMensajeCarrito(`Stock disponible: ${stock}.`);
    }

    actualizarCarrito();
}

function quitarDelCarrito(id) {
    carrito.delete(String(id));
    actualizarCarrito();
    mostrarMensajeCarrito("Producto retirado del carrito.");
}

function actualizarCarrito() {
    elementos.listaCarrito.replaceChildren();

    let unidades = 0;
    let subtotal = 0;

    carrito.forEach((item) => {
        unidades += item.cantidad;

        const precio = obtenerPrecio(item.producto);
        subtotal += precio * item.cantidad;

        elementos.listaCarrito.appendChild(crearItemCarrito(item));
    });

    elementos.contadorCarrito.textContent = String(unidades);
    elementos.subtotal.textContent = formatearPrecio(subtotal);
    elementos.btnContinuar.disabled = unidades === 0;
    guardarCarrito();

    if (carrito.size === 0) {
        const vacio = document.createElement("p");
        vacio.className = "carrito-vacio";
        vacio.textContent = "Todavía no has agregado productos.";
        elementos.listaCarrito.appendChild(vacio);
    }
}

function crearItemCarrito(item) {
    const contenedor = document.createElement("article");
    contenedor.className = "item-carrito";

    const informacion = document.createElement("div");
    informacion.className = "item-carrito-informacion";
    if (typeof item.producto.imagen === "string" && item.producto.imagen.startsWith("data:image/")) {
        const imagen = document.createElement("img");
        imagen.className = "imagen-item-carrito";
        imagen.src = item.producto.imagen;
        imagen.alt = item.producto.nombre || "Producto";
        informacion.appendChild(imagen);
    }

    const nombre = document.createElement("h3");
    nombre.textContent = item.producto.nombre || "Producto";

    const precio = document.createElement("p");
    precio.textContent = formatearPrecio(
        obtenerPrecio(item.producto) * item.cantidad
    );

    const controles = document.createElement("div");
    controles.className = "controles-cantidad";

    const disminuir = document.createElement("button");
    disminuir.type = "button";
    disminuir.textContent = "−";
    disminuir.setAttribute("aria-label", "Disminuir cantidad");
    disminuir.addEventListener("click", () =>
        cambiarCantidad(item.producto.id, -1)
    );

    const cantidad = document.createElement("span");
    cantidad.className = "cantidad-valor";
    cantidad.textContent = String(item.cantidad);

    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.textContent = "+";
    aumentar.disabled = item.cantidad >= obtenerStock(item.producto);
    aumentar.setAttribute("aria-label", "Aumentar cantidad");
    aumentar.addEventListener("click", () =>
        cambiarCantidad(item.producto.id, 1)
    );

    controles.append(disminuir, cantidad, aumentar);
    informacion.append(nombre, precio, controles);

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "quitar-producto";
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", () =>
        quitarDelCarrito(item.producto.id)
    );

    contenedor.append(informacion, quitar);

    return contenedor;
}

function abrirCarrito() {
    elementos.panelCarrito.classList.add("abierto");
    elementos.panelCarrito.setAttribute("aria-hidden", "false");
    elementos.fondoCarrito.hidden = false;
    document.body.classList.add("carrito-abierto");
    elementos.cerrarCarrito.focus();
}

function cerrarCarrito() {
    elementos.panelCarrito.classList.remove("abierto");
    elementos.panelCarrito.setAttribute("aria-hidden", "true");
    elementos.fondoCarrito.hidden = true;
    document.body.classList.remove("carrito-abierto");
}

function mostrarMensajeCarrito(mensaje) {
    elementos.mensajeCarrito.textContent = mensaje;
}

function obtenerStock(producto) {
    const stock = Number(producto.stock);
    return Number.isFinite(stock) && stock > 0 ? Math.floor(stock) : 0;
}

function obtenerPrecio(producto) {
    const precio = Number(producto.precio);
    return Number.isFinite(precio) && precio >= 0 ? precio : 0;
}

function obtenerNombreCategoria(producto) {
    return producto.categoria?.nombre || "";
}

function obtenerNombreMarca(producto) {
    return producto.marca?.nombre || "";
}

function obtenerIniciales(nombre) {
    return String(nombre || "CT")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((palabra) => palabra.charAt(0))
        .join("")
        .toUpperCase();
}

function normalizar(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es");
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number.isFinite(Number(valor)) ? Number(valor) : 0);
}


function guardarCarrito() {
    try {
        const datos = [...carrito.values()].map((item) => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            nombre: item.producto.nombre || "Producto",
            precio: obtenerPrecio(item.producto),
            imagen: typeof item.producto.imagen === "string" ? item.producto.imagen : null
        }));
        sessionStorage.setItem("calleTuningCarrito", JSON.stringify(datos));
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
    }
}

function restaurarCarrito() {
    try {
        const datos = JSON.parse(
            sessionStorage.getItem("calleTuningCarrito") || "[]"
        );

        if (!Array.isArray(datos)) return;

        datos.forEach((guardado) => {
            const producto = productosDisponibles.find(
                (p) => String(p.id) === String(guardado.productoId)
            );
            const cantidad = Number(guardado.cantidad);

            if (producto && Number.isInteger(cantidad) &&
                cantidad > 0 && cantidad <= obtenerStock(producto)) {
                carrito.set(String(producto.id), { producto, cantidad });
            }
        });
    } catch (error) {
        console.error("No se pudo restaurar el carrito:", error);
        sessionStorage.removeItem("calleTuningCarrito");
    }
}

function continuarCompra() {
    if (carrito.size === 0) {
        mostrarMensajeCarrito("Agrega al menos un producto antes de continuar.");
        return;
    }

    guardarCarrito();
    window.location.href = "/checkout.html";
}

