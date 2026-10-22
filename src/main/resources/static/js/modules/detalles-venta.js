
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules["detalles-venta"] = {
    title: "Detalles de venta",
    endpoint: "detalles-venta",
    singular: "detalle de venta",
    fields: [
        ["cantidad", "Cantidad", "number", true],
        ["precioUnitario", "Precio unitario", "number", true],
        ["subtotal", "Subtotal", "number", true],
        ["venta", "Venta", "relation", true, "ventas"],
        ["producto", "Producto", "relation", true, "productos"]
    ],
    columns: [
        "id", "cantidad", "precioUnitario", "subtotal", "venta", "producto"
    ]
};
