
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules.proveedores = {
    title: "Proveedores",
    endpoint: "proveedores",
    singular: "proveedor",
    fields: [
        ["nombre", "Nombre", "text", true],
        ["telefono", "Teléfono", "text", true],
        ["email", "Correo", "email", true],
        ["direccion", "Dirección", "text", true]
    ],
    columns: ["id", "nombre", "telefono", "email", "direccion"]
};
