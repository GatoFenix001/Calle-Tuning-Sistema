
"use strict";

document.addEventListener("DOMContentLoaded", iniciarConfirmacion);

function iniciarConfirmacion() {
    document.getElementById("anioActual").textContent =
        new Date().getFullYear();

    const estado = document.getElementById("estadoCompra");
    const resumen = document.getElementById("resumenCompra");
    const error = document.getElementById("compraNoConfirmada");

    /*
     * Este dato lo estableceremos desde el proceso de compra real,
     * después de que el servidor confirme el registro de la venta.
     */
    let compra = null;

    try {
        const contenido = sessionStorage.getItem(
            "calleTuningCompraConfirmada"
        );

        if (contenido) {
            compra = JSON.parse(contenido);
        }
    } catch (e) {
        console.error("No se pudo leer la confirmación:", e);
    }

    estado.hidden = true;

    if (!esCompraValida(compra)) {
        error.hidden = false;
        return;
    }

    mostrarCompra(compra);
    resumen.hidden = false;
}

function esCompraValida(compra) {
    if (!compra || typeof compra !== "object") {
        return false;
    }

    if (
        compra.id == null ||
        !Array.isArray(compra.detalles) ||
        compra.detalles.length === 0
    ) {
        return false;
    }

    if (
        !Number.isFinite(Number(compra.total)) ||
        Number(compra.total) < 0
    ) {
        return false;
    }

    return compra.detalles.every((detalle) =>
        detalle &&
        typeof detalle.productoNombre === "string" &&
        detalle.productoNombre.trim() !== "" &&
        Number.isInteger(Number(detalle.cantidad)) &&
        Number(detalle.cantidad) > 0 &&
        Number.isFinite(Number(detalle.precioUnitario)) &&
        Number(detalle.precioUnitario) >= 0 &&
        Number.isFinite(Number(detalle.subtotal)) &&
        Number(detalle.subtotal) >= 0
    );
}

function mostrarCompra(compra) {
    document.getElementById("numeroVenta").textContent =
        String(compra.id);

    document.getElementById("fechaVenta").textContent =
        formatearFecha(compra.fecha);

    const cuerpo = document.getElementById("detalleCompra");
    cuerpo.replaceChildren();

    compra.detalles.forEach((detalle) => {
        const fila = document.createElement("tr");

        agregarCelda(fila, detalle.productoNombre);
        agregarCelda(fila, String(detalle.cantidad));
        agregarCelda(fila, formatearPrecio(detalle.precioUnitario));
        agregarCelda(fila, formatearPrecio(detalle.subtotal));

        cuerpo.appendChild(fila);
    });

    document.getElementById("totalCompra").textContent =
        formatearPrecio(compra.total);
}

function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido;
    fila.appendChild(celda);
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(valor));
}

function formatearFecha(valor) {
    if (!valor) {
        return "No disponible";
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return "No disponible";
    }

    return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(fecha);
}
