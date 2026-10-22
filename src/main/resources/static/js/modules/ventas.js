
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules.ventas = {
    title: "Ventas",
    endpoint: "ventas",
    singular: "venta",
    fields: [
        ["fecha", "Fecha", "datetime-local", true],
        ["total", "Total", "number", true],
        ["cliente", "Cliente", "relation", true, "clientes"],
        ["usuario", "Usuario", "relation", true, "usuarios"]
    ],
    columns: ["id", "fecha", "total", "cliente", "usuario"]
};
