
package com.calletuning.inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CompraResponse {

    private Long id;
    private LocalDateTime fecha;
    private BigDecimal total;
    private String metodoPago;
    private List<Detalle> detalles;

    public CompraResponse() {
    }

    public CompraResponse(
            Long id,
            LocalDateTime fecha,
            BigDecimal total,
            List<Detalle> detalles,
            String metodoPago) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.detalles = detalles;
        this.metodoPago = metodoPago;
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public String getMetodoPago() { return metodoPago; }

    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public List<Detalle> getDetalles() {
        return detalles;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public void setDetalles(List<Detalle> detalles) {
        this.detalles = detalles;
    }

    public static class Detalle {

        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;

        public Detalle() {
        }

        public Detalle(
                String productoNombre,
                Integer cantidad,
                BigDecimal precioUnitario,
                BigDecimal subtotal) {
            this.productoNombre = productoNombre;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
            this.subtotal = subtotal;
        }

        public String getProductoNombre() {
            return productoNombre;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public BigDecimal getPrecioUnitario() {
            return precioUnitario;
        }

        public BigDecimal getSubtotal() {
            return subtotal;
        }
    }
}
