
"use strict";

window.API = "/api";

window.obtenerTokenCSRF = function () {
    const cookie = document.cookie
        .split("; ")
        .find(fila => fila.startsWith("XSRF-TOKEN="));

    return cookie
        ? decodeURIComponent(cookie.substring("XSRF-TOKEN=".length))
        : null;
};

window.fetchSeguro = async function (url, opciones = {}) {
    const metodo = (opciones.method || "GET").toUpperCase();
    const headers = new Headers(opciones.headers || {});

    if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(metodo)) {
        const token = window.obtenerTokenCSRF();

        if (token) {
            headers.set("X-XSRF-TOKEN", token);
        }
    }

    return fetch(url, {
        ...opciones,
        headers,
        credentials: "same-origin"
    });
};

window.getJSON = async function (url) {
    const respuesta = await window.fetchSeguro(url);

    if (!respuesta.ok) {
        throw new Error("Error HTTP " + respuesta.status);
    }

    return respuesta.json();
};
