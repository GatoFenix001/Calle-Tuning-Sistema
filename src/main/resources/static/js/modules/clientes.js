
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules.clientes = {
    title: "Clientes",
    endpoint: "clientes",
    singular: "cliente",
    fields: [
        ["nombre", "Nombre", "text", true],
        ["apellido", "Apellido", "text", true],
        ["documento", "Documento", "text", true],
        ["telefono", "Teléfono", "text", true],
        ["email", "Correo", "email", true]
    ],
    columns: ["id", "nombre", "apellido", "documento", "telefono", "email"]
};
