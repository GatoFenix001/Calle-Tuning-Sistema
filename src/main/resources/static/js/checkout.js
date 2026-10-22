"use strict";
document.addEventListener("DOMContentLoaded", iniciarCheckout);

let carritoCompra = [];

function iniciarCheckout() {
  document.getElementById("anioActual").textContent = new Date().getFullYear();
  const form = document.getElementById("formCompra");
  form.addEventListener("submit", enviarCompra);

  try {
    carritoCompra = JSON.parse(sessionStorage.getItem("calleTuningCarrito") || "[]");
  } catch (_) {
    carritoCompra = [];
  }
  if (!Array.isArray(carritoCompra) || carritoCompra.length === 0) {
    mostrarError("Tu carrito está vacío. Regresa a la tienda y agrega productos.");
    document.getElementById("btnConfirmarCompra").disabled = true;
    return;
  }
  renderizarResumen();
  cargarPerfilComprador();
}

async function cargarPerfilComprador() {
  try {
    const r = await fetch("/api/auth/me", { credentials: "same-origin", headers: { "Accept": "application/json" } });
    if (!r.ok) {
      mostrarError("Inicia sesión con tu cuenta de cliente antes de confirmar la compra.");
      document.getElementById("btnConfirmarCompra").disabled = true;
      return;
    }
    const perfil = await r.json();
    if (perfil.rol !== "CLIENTE") {
      mostrarError("Esta compra debe realizarse desde una cuenta de cliente.");
      document.getElementById("btnConfirmarCompra").disabled = true;
      return;
    }
    document.getElementById("nombreComprador").value = perfil.nombre || "";
    document.getElementById("apellidoComprador").value = perfil.apellido || "";
    document.getElementById("emailComprador").value = perfil.email || "";
    if (!perfil.email) {
      mostrarError("Tu cuenta no tiene correo registrado. Contacta al administrador para actualizarla.");
      document.getElementById("btnConfirmarCompra").disabled = true;
    }
  } catch (_) {
    mostrarError("No se pudo cargar el perfil. Inicia sesión e inténtalo nuevamente.");
    document.getElementById("btnConfirmarCompra").disabled = true;
  }
}

function renderizarResumen() {
  const contenedor = document.getElementById("resumenProductos");
  contenedor.replaceChildren();
  let total = 0;
  carritoCompra.forEach(item => {
    const cantidad = Number(item.cantidad);
    const nombre = String(item.nombre || ("Producto #" + item.productoId));
    const precio = Number(item.precio);
    const subtotal = Number.isFinite(precio) ? precio * cantidad : 0;
    total += subtotal;
    const fila = document.createElement("div");
    fila.className = "resumen-producto";
    const texto = document.createElement("div");
    if (typeof item.imagen === "string" && item.imagen.startsWith("data:image/")) {
      const imagen = document.createElement("img");
      imagen.src = item.imagen; imagen.alt = nombre; imagen.className = "imagen-resumen-compra";
      fila.appendChild(imagen);
    }
    const titulo = document.createElement("strong");
    titulo.textContent = nombre;
    const detalle = document.createElement("div");
    detalle.className = "texto-ayuda";
    detalle.style.margin = "4px 0 0";
    detalle.textContent = `${cantidad} × ${formatearPrecio(precio)}`;
    texto.append(titulo, detalle);
    const importe = document.createElement("strong");
    importe.textContent = formatearPrecio(subtotal);
    fila.append(texto, importe);
    contenedor.appendChild(fila);
  });
  document.getElementById("totalPedido").textContent = formatearPrecio(total);
}

async function enviarCompra(evento) {
  evento.preventDefault();
  const form = evento.currentTarget;
  if (!form.reportValidity()) return;
  if (!carritoCompra.length) {
    mostrarError("Tu carrito está vacío.");
    return;
  }

  const datos = new FormData(form);
  const solicitud = {
    nombre: String(datos.get("nombre") || "").trim(),
    apellido: String(datos.get("apellido") || "").trim(),
    documento: String(datos.get("documento") || "").trim(),
    telefono: String(datos.get("telefono") || "").trim() || null,
    email: String(datos.get("email") || "").trim(),
    metodoPago: String(datos.get("metodoPago") || "").trim(),
    productos: carritoCompra.map(item => ({
      productoId: Number(item.productoId),
      cantidad: Number(item.cantidad)
    }))
  };

  const boton = document.getElementById("btnConfirmarCompra");
  boton.disabled = true;
  boton.textContent = "Registrando compra...";
  mostrarError("");

  try {
    const respuesta = await window.fetchSeguro("/api/ventas/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(solicitud)
    });

    if (!respuesta.ok) {
      let mensaje = "";
      try {
        const cuerpo = await respuesta.json();
        mensaje = cuerpo.detail || cuerpo.message || cuerpo.error || "";
      } catch (_) {}
      if (respuesta.status === 401) {
        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente y vuelve a intentar.");
      }
      if (respuesta.status === 403) {
        throw new Error("Debes iniciar sesión con una cuenta de cliente para comprar. Verifica también que la sesión siga activa.");
      }
      if (respuesta.status === 409) {
        throw new Error(mensaje || "No hay stock suficiente para uno de los productos. Regresa a la tienda y revisa las cantidades.");
      }
      throw new Error(mensaje || `No se pudo registrar la compra (HTTP ${respuesta.status}).`);
    }

    const compra = await respuesta.json();
    if (!compra || compra.id == null || !Array.isArray(compra.detalles)) {
      throw new Error("El servidor respondió sin un comprobante de compra válido. No se vació el carrito.");
    }

    sessionStorage.setItem("calleTuningCompraConfirmada", JSON.stringify(compra));
    sessionStorage.removeItem("calleTuningCarrito");
    window.location.href = "/confirmacion-compra.html";
  } catch (error) {
    mostrarError(error.message || "Ocurrió un error al registrar la compra.");
    boton.disabled = false;
    boton.textContent = "Confirmar y registrar compra";
  }
}

function mostrarError(mensaje) {
  document.getElementById("mensajeCompra").textContent = mensaje;
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency: "PEN", minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(Number.isFinite(Number(valor)) ? Number(valor) : 0);
}

