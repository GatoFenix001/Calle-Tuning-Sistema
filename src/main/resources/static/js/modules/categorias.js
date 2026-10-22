
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules.categorias = {
    title: "Categorías",
    endpoint: "categorias",
    singular: "categoría",
    fields: [
        ["nombre", "Nombre", "text", true],
        ["descripcion", "Descripción", "textarea", false]
    ],
    columns: ["id", "nombre", "descripcion"]
};
