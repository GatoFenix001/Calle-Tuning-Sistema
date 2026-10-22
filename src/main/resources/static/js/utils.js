
"use strict";

/* ===================== UTILIDADES COMUNES ===================== */

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

    return String(value).slice(0, 16);
}

function mostrarError(error, mensaje) {
    console.error(mensaje, error);

    if (typeof toast === "function") {
        toast(
            mensaje + ": " + (error.message || "Error desconocido"),
            true
        );
    }
}
