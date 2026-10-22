
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const modal = $("modalAuth");

  if (!modal) return;

  // Obtener token CSRF
  function csrf() {
    const c = document.cookie
      .split(";")
      .map(v => v.trim())
      .find(v => v.startsWith("XSRF-TOKEN="));

    return c
      ? decodeURIComponent(c.substring("XSRF-TOKEN=".length))
      : "";
  }

  // Normalizar roles para evitar errores por mayúsculas
  function normalizarRol(rol) {
    return String(rol || "").trim().toUpperCase();
  }

  // Abrir modal
  function abrir(tipo) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    mostrarTipo(tipo);
  }

  // Cerrar modal
  function cerrar() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  // Alternar entre login y registro
  function mostrarTipo(tipo) {
    const login = tipo === "login";

    $("formLoginModal").hidden = !login;
    $("formRegistroModal").hidden = login;

    $("tabLogin").classList.toggle("activo", login);
    $("tabRegistro").classList.toggle("activo", !login);

    $("tituloAuth").textContent = login
      ? "Bienvenido"
      : "Crear cuenta de cliente";

    $("mensajeLogin").textContent = "";
    $("mensajeRegistroModal").textContent = "";
  }

  // Eventos del modal
  $("abrirLogin").addEventListener("click", () => abrir("login"));
  $("abrirRegistro").addEventListener("click", () => abrir("registro"));

  $("tabLogin").addEventListener("click", () => mostrarTipo("login"));
  $("tabRegistro").addEventListener("click", () => mostrarTipo("registro"));

  modal.querySelectorAll("[data-cerrar-auth]").forEach(el => {
    el.addEventListener("click", cerrar);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrar();
  });

  // ==========================================
  // INICIO DE SESIÓN
  // ==========================================

  $("formLoginModal").addEventListener("submit", async e => {
    e.preventDefault();

    const msg = $("mensajeLogin");
    msg.textContent = "";

    const data = new URLSearchParams(
      new FormData(e.currentTarget)
    );

    try {
      const token = csrf();

      if (!token) {
        throw new Error(
          "Recarga la página e inténtalo nuevamente."
        );
      }

      const r = await fetch("/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-XSRF-TOKEN": token
        },
        body: data.toString(),
        redirect: "follow"
      });

      if (r.ok) {
        const perfil = await fetch("/api/auth/me", {
          credentials: "same-origin",
          headers: {
            Accept: "application/json"
          }
        });

        if (perfil.ok) {
          const user = await perfil.json();

          // CORRECCIÓN PRINCIPAL
          // Administrador -> ADMINISTRADOR
          // Vendedor -> VENDEDOR
          // CLIENTE -> CLIENTE
          const rol = normalizarRol(user.rol);

          console.log("Rol autenticado:", rol);

          if (rol === "CLIENTE") {
            await cargarPerfil();
            cerrar();
            return;
          }

          if (rol === "VENDEDOR") {
            window.location.href = "/vendedor.html";
            return;
          }

          if (rol === "ADMINISTRADOR") {
            window.location.href = "/admin.html";
            return;
          }

          msg.textContent =
            "Tu usuario tiene un rol no reconocido: " + rol;
          return;
        }
      }

      msg.textContent =
        "No se pudo iniciar sesión. Verifica tu usuario y contraseña.";

    } catch (err) {
      console.error("Error de inicio de sesión:", err);

      msg.textContent =
        err.message || "Error de conexión.";
    }
  });

  // ==========================================
  // REGISTRO DE CLIENTES
  // ==========================================

  $("formRegistroModal").addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.currentTarget;
    const msg = $("mensajeRegistroModal");
    const button = form.querySelector("button[type=submit]");

    msg.textContent = "";

    const d = new FormData(form);

    button.disabled = true;

    try {
      const token = csrf();

      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      if (token) {
        headers["X-XSRF-TOKEN"] = token;
      }

      const r = await fetch("/api/auth/registro-cliente", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          nombre: String(d.get("nombre")).trim(),
          apellido: String(d.get("apellido")).trim(),
          email: String(d.get("email")).trim(),
          username: String(d.get("username")).trim(),
          password: String(d.get("password"))
        })
      });

      const body = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(
          body.mensaje || "No se pudo crear la cuenta."
        );
      }

      msg.style.color = "#70d79b";
      msg.textContent =
        "Cuenta creada. Ahora puedes iniciar sesión.";

      form.reset();

      setTimeout(() => mostrarTipo("login"), 900);

    } catch (err) {
      msg.style.color = "#ff737b";

      msg.textContent =
        err.message || "Error de conexión.";

    } finally {
      button.disabled = false;
    }
  });

  // ==========================================
  // CARGAR PERFIL DEL CLIENTE
  // ==========================================

  async function cargarPerfil() {
    try {
      const r = await fetch("/api/auth/me", {
        credentials: "same-origin",
        headers: {
          Accept: "application/json"
        }
      });

      if (!r.ok) return;

      const user = await r.json();

      // También normalizamos el rol aquí
      const rol = normalizarRol(user.rol);

      if (rol !== "CLIENTE") return;

      $("accionesCuenta").hidden = true;
      $("cuentaActiva").hidden = false;

      $("nombreSesion").textContent =
        [user.nombre, user.apellido]
          .filter(Boolean)
          .join(" ") || user.username;

      sessionStorage.setItem(
        "calleTuningPerfil",
        JSON.stringify(user)
      );

    } catch (err) {
      console.error("Error al cargar perfil:", err);
    }
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  $("cerrarSesion").addEventListener("click", async () => {
    const token = csrf();

    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: token
          ? { "X-XSRF-TOKEN": token }
          : {}
      });

    } finally {
      sessionStorage.removeItem("calleTuningPerfil");
      sessionStorage.removeItem("calleTuningCarrito");

      window.location.href = "/tienda.html";
    }
  });

  // Verificar sesión al cargar la página
  cargarPerfil();

})();
