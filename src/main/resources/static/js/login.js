const params = new URLSearchParams(window.location.search);

const errorMessage = document.getElementById("errorMessage");
const logoutMessage = document.getElementById("logoutMessage");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginForm = document.querySelector("form");

if (params.has("error")) {
    errorMessage.hidden = false;
}

if (params.has("logout")) {
    logoutMessage.hidden = false;
}

togglePassword.addEventListener("click", () => {
    const mostrar = passwordInput.type === "password";
    passwordInput.type = mostrar ? "text" : "password";
    togglePassword.textContent = mostrar ? "Ocultar" : "Ver";
});

function obtenerCookie(nombre) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const partes = cookie.trim().split("=");
        if (partes.shift() === nombre) {
            return partes.join("=");
        }
    }

    return null;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.hidden = true;

    const token = obtenerCookie("XSRF-TOKEN");

    if (!token) {
        errorMessage.textContent =
            "No se pudo obtener el token de seguridad. Recarga la página e inténtalo nuevamente.";
        errorMessage.hidden = false;
        return;
    }

    const datos = new URLSearchParams(new FormData(loginForm));

    try {
        const respuesta = await fetch("/login", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-XSRF-TOKEN": decodeURIComponent(token)
            },
            body: datos.toString(),
            redirect: "follow"
        });

        if (respuesta.redirected) {
            window.location.assign(respuesta.url);
            return;
        }

        errorMessage.textContent =
            "No se pudo iniciar sesión. Revisa tus credenciales y la configuración de seguridad.";
        errorMessage.hidden = false;

    } catch (error) {
        errorMessage.textContent =
            "No se pudo conectar con el servidor. Verifica que Spring Boot esté ejecutándose.";
        errorMessage.hidden = false;
    }
});