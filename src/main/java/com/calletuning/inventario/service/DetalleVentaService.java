package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.DetalleVenta;
import com.calletuning.inventario.entity.Producto;
import com.calletuning.inventario.repository.DetalleVentaRepository;
import com.calletuning.inventario.repository.ProductoRepository;

@Service
public class DetalleVentaService {

    private final DetalleVentaRepository detalleVentaRepository;
    private final ProductoRepository productoRepository;

    public DetalleVentaService(
            DetalleVentaRepository detalleVentaRepository,
            ProductoRepository productoRepository) {

        this.detalleVentaRepository = detalleVentaRepository;
        this.productoRepository = productoRepository;
    }

    public List<DetalleVenta> listar() {
        return detalleVentaRepository.findAll();
    }

    public Optional<DetalleVenta> buscarPorId(Long id) {
        return detalleVentaRepository.findById(id);
    }

    public DetalleVenta guardar(DetalleVenta detalleVenta) {

        Producto producto = productoRepository.findById(
                detalleVenta.getProducto().getId()
        ).orElseThrow(() ->
                new RuntimeException("Producto no encontrado"));

        if (producto.getStock() < detalleVenta.getCantidad()) {
            throw new RuntimeException("Stock insuficiente");
        }

        producto.setStock(
                producto.getStock() - detalleVenta.getCantidad()
        );

        productoRepository.save(producto);

        return detalleVentaRepository.save(detalleVenta);
    }

    public DetalleVenta actualizar(Long id, DetalleVenta detalleVenta) {

        DetalleVenta existente = detalleVentaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Detalle de venta no encontrado"));

        existente.setCantidad(detalleVenta.getCantidad());
        existente.setPrecioUnitario(detalleVenta.getPrecioUnitario());
        existente.setSubtotal(detalleVenta.getSubtotal());
        existente.setVenta(detalleVenta.getVenta());
        existente.setProducto(detalleVenta.getProducto());

        return detalleVentaRepository.save(existente);
    }

    public void eliminar(Long id) {
        detalleVentaRepository.deleteById(id);
    }
}