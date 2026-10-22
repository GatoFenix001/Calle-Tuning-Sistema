
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules["movimientos-inventario"] = {
    title: "Movimientos de inventario",
    endpoint: "movimientos-inventario",
    singular: "movimiento",
    fields: [
        ["tipoMovimiento", "Tipo de movimiento", "select", true, [
            ["ENTRADA", "Entrada"],
            ["SALIDA", "Salida"]
        ]],
        ["cantidad", "Cantidad", "number", true],
        ["fecha", "Fecha", "datetime-local", true],
        ["motivo", "Motivo", "text", true],
        ["producto", "Producto", "relation", true, "productos"],
        ["usuario", "Usuario", "relation", true, "usuarios"]
    ],
    columns: [
        "id", "tipoMovimiento", "cantidad", "fecha", "motivo", "producto", "usuario"
    ]
};
