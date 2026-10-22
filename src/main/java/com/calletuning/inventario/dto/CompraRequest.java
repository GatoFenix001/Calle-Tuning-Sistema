
package com.calletuning.inventario.dto;

import java.util.List;

public class CompraRequest {

    private String nombre;
    private String apellido;
    private String documento;
    private String telefono;
    private String email;
    private String metodoPago;
    private List<ItemCompra> productos;

    public CompraRequest() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public List<ItemCompra> getProductos() {
        return productos;
    }

    public void setProductos(List<ItemCompra> productos) {
        this.productos = productos;
    }

    public static class ItemCompra {

        private Long productoId;
        private Integer cantidad;

        public ItemCompra() {
        }

        public Long getProductoId() {
            return productoId;
        }

        public void setProductoId(Long productoId) {
            this.productoId = productoId;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }
    }
}
