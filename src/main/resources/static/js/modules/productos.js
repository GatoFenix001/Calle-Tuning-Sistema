
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules.productos = {
    title: "Productos",
    endpoint: "productos",
    singular: "producto",
    fields: [
        ["nombre", "Nombre", "text", true],
        ["descripcion", "Descripción", "textarea", true],
        ["imagen", "Imagen del producto", "image", false],
        ["precio", "Precio", "number", true],
        ["stock", "Stock", "number", true],
        ["stockMinimo", "Stock mínimo", "number", true],
        ["estado", "Estado", "select", true, [
            ["true", "Activo"],
            ["false", "Inactivo"]
        ]],
        ["categoria", "Categoría", "relation", true, "categorias"],
        ["marca", "Marca", "relation", true, "marcas"],
        ["proveedor", "Proveedor", "relation", true, "proveedores"]
    ],
    columns: ["id", "nombre", "precio", "stock", "stockMinimo", "estado"]
};
