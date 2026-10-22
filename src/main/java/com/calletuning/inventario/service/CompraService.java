
package com.calletuning.inventario.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.calletuning.inventario.dto.CompraRequest;
import com.calletuning.inventario.dto.CompraResponse;
import com.calletuning.inventario.entity.Cliente;
import com.calletuning.inventario.entity.DetalleVenta;
import com.calletuning.inventario.entity.Producto;
import com.calletuning.inventario.entity.Usuario;
import com.calletuning.inventario.entity.Venta;
import com.calletuning.inventario.repository.ClienteRepository;
import com.calletuning.inventario.repository.DetalleVentaRepository;
import com.calletuning.inventario.repository.ProductoRepository;
import com.calletuning.inventario.repository.UsuarioRepository;
import com.calletuning.inventario.repository.VentaRepository;

@Service
public class CompraService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    public CompraService(
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            VentaRepository ventaRepository,
            DetalleVentaRepository detalleVentaRepository) {

        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
    }

    @Transactional
    public CompraResponse comprar(
            CompraRequest solicitud,
            String usernameAutenticado) {

        validarSolicitud(solicitud);

        Usuario usuario = usuarioRepository
                .findByUsername(usernameAutenticado)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "No se encontró el usuario autenticado."));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta de usuario está deshabilitada.");
        }

        String documento = solicitud.getDocumento().trim();

        Cliente cliente = clienteRepository.findByDocumento(documento)
                .orElseGet(() -> {
                    Cliente nuevo = new Cliente(
                            solicitud.getNombre().trim(),
                            solicitud.getApellido().trim(),
                            documento,
                            limpiar(solicitud.getTelefono()),
                            limpiar(solicitud.getEmail()));
                    return clienteRepository.save(nuevo);
                });

        Set<Long> ids = new HashSet<>();
        for (CompraRequest.ItemCompra item : solicitud.getProductos()) {
            if (!ids.add(item.getProductoId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El carrito contiene un producto repetido.");
            }
        }

        /*
         * Primero se bloquean y validan todos los productos.
         * Si alguna validación falla, la transacción se revierte.
         */
        List<Producto> productos = new ArrayList<>();
        for (CompraRequest.ItemCompra item : solicitud.getProductos()) {
            Producto producto = productoRepository
                    .buscarPorIdParaCompra(item.getProductoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Uno de los productos ya no existe."));

            if (!Boolean.TRUE.equals(producto.getEstado())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + producto.getNombre()
                                + " no está disponible.");
            }

            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Las cantidades deben ser mayores que cero.");
            }

            if (producto.getStock() == null
                    || producto.getStock() < item.getCantidad()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock insuficiente para " + producto.getNombre());
            }

            if (producto.getPrecio() == null
                    || producto.getPrecio().signum() < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El precio de un producto no es válido.");
            }

            productos.add(producto);
        }

        BigDecimal total = BigDecimal.ZERO;
        List<BigDecimal> subtotales = new ArrayList<>();

        for (int i = 0; i < productos.size(); i++) {
            Producto producto = productos.get(i);
            int cantidad = solicitud.getProductos().get(i).getCantidad();

            BigDecimal subtotal = producto.getPrecio()
                    .multiply(BigDecimal.valueOf(cantidad))
                    .setScale(2, RoundingMode.HALF_UP);

            subtotales.add(subtotal);
            total = total.add(subtotal);
        }

        String metodoPago = solicitud.getMetodoPago();
        if (metodoPago == null || !Set.of("TARJETA", "YAPE", "PLIN").contains(metodoPago.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un método de pago válido.");
        }

        LocalDateTime fecha = LocalDateTime.now();
        Venta venta = new Venta(fecha, total, cliente, usuario);
        venta.setMetodoPago(metodoPago.toUpperCase());
        venta = ventaRepository.saveAndFlush(venta);

        List<CompraResponse.Detalle> respuestaDetalles = new ArrayList<>();

        for (int i = 0; i < productos.size(); i++) {
            Producto producto = productos.get(i);
            int cantidad = solicitud.getProductos().get(i).getCantidad();
            BigDecimal subtotal = subtotales.get(i);
            BigDecimal precioUnitario = producto.getPrecio()
                    .setScale(2, RoundingMode.HALF_UP);

            DetalleVenta detalle = new DetalleVenta(
                    cantidad,
                    precioUnitario,
                    subtotal,
                    venta,
                    producto);

            detalleVentaRepository.save(detalle);

            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto);

            respuestaDetalles.add(new CompraResponse.Detalle(
                    producto.getNombre(),
                    cantidad,
                    precioUnitario,
                    subtotal));
        }

        detalleVentaRepository.flush();
        productoRepository.flush();

        return new CompraResponse(
                venta.getId(),
                venta.getFecha(),
                venta.getTotal(),
                respuestaDetalles,
                venta.getMetodoPago());
    }

    private void validarSolicitud(CompraRequest solicitud) {
        if (solicitud == null
                || solicitud.getNombre() == null
                || solicitud.getNombre().isBlank()
                || solicitud.getApellido() == null
                || solicitud.getApellido().isBlank()
                || solicitud.getDocumento() == null
                || solicitud.getDocumento().isBlank()
                || solicitud.getDocumento().trim().length() > 20
                || solicitud.getNombre().trim().length() > 100
                || solicitud.getApellido().trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completa correctamente los datos del comprador.");
        }

        if (solicitud.getTelefono() != null
                && solicitud.getTelefono().length() > 20) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El teléfono no puede superar 20 caracteres.");
        }

        if (solicitud.getEmail() != null
                && solicitud.getEmail().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo no puede superar 100 caracteres.");
        }

        if (solicitud.getProductos() == null
                || solicitud.getProductos().isEmpty()
                || solicitud.getProductos().size() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El carrito no contiene productos válidos.");
        }

        for (CompraRequest.ItemCompra item : solicitud.getProductos()) {
            if (item == null
                    || item.getProductoId() == null
                    || item.getProductoId() <= 0
                    || item.getCantidad() == null
                    || item.getCantidad() <= 0
                    || item.getCantidad() > 10000) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Un producto o cantidad del carrito no es válido.");
            }
        }
    }

    private String limpiar(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
