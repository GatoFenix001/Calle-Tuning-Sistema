
window.CalleTuningModules = window.CalleTuningModules || {};

window.CalleTuningModules.usuarios = {
    title: "Usuarios",
    endpoint: "usuarios",
    singular: "usuario",
    fields: [
        ["nombre", "Nombre", "text", true],
        ["apellido", "Apellido", "text", true],
        ["username", "Usuario", "text", true],
        ["password", "Contraseña", "password", false],
        ["estado", "Estado", "select", true, [
            ["true", "Activo"],
            ["false", "Inactivo"]
        ]],
        ["rol", "Rol", "relation", true, "roles"]
    ],
    columns: ["id", "nombre", "apellido", "username", "rol", "estado"]
};
