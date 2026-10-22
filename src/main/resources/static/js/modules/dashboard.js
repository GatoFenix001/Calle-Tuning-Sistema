"use strict";

window.CalleTuningDashboard = {
    async render() {
        const content = document.getElementById("appContent");

        content.innerHTML = `
            <div class="hero">
                <h1>Bienvenido a Calle Tuning</h1>
                <p>Control centralizado de productos, inventario, clientes y ventas.</p>
            </div>

            <div class="stats">
                <div class="stat">
                    <div class="label">Productos</div>
                    <div class="value" id="stProducts">—</div>
                    <div class="small">Registrados en PostgreSQL</div>
                </div>

                <div class="stat">
                    <div class="label">Stock total</div>
                    <div class="value" id="stStock">—</div>
                    <div class="small">Unidades disponibles</div>
                </div>

                <div class="stat">
                    <div class="label">Clientes</div>
                    <div class="value" id="stClients">—</div>
                    <div class="small">Clientes registrados</div>
                </div>

                <div class="stat">
                    <div class="label">Ventas</div>
                    <div class="value" id="stSales">—</div>
                    <div class="small">Ventas registradas</div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-head">
                    <h3>Resumen del sistema</h3>
                    <button class="btn btn-primary"
                        onclick="mostrarModulo('productos')">
                        Gestionar productos
                    </button>
                </div>

                <div class="panel-body">
                    <p style="font-size:13px;color:#666">
                        Los datos se consultan desde Spring Boot y PostgreSQL.
                    </p>
                </div>
            </div>
        `;

        try {
            const [productos, clientes, ventas] = await Promise.all([
                getJSON(API + "/productos"),
                getJSON(API + "/clientes"),
                getJSON(API + "/ventas")
            ]);

            document.getElementById("stProducts").textContent =
                productos.length;

            document.getElementById("stStock").textContent =
                productos.reduce(
                    (total, producto) => total + (Number(producto.stock) || 0),
                    0
                );

            document.getElementById("stClients").textContent =
                clientes.length;

            document.getElementById("stSales").textContent =
                ventas.length;

        } catch (error) {
            console.error("No se pudo cargar el resumen:", error);

            ["stProducts", "stStock", "stClients", "stSales"].forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.textContent = "!";
            });

            if (typeof toast === "function") {
                toast(
                    "No se pudo cargar el resumen: " +
                    (error.message || "Error desconocido"),
                    true
                );
            }
        }
    }
};
