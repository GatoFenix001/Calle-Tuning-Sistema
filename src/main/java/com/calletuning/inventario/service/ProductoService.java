package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.Producto;
import com.calletuning.inventario.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto producto) {
        Producto existente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        existente.setNombre(producto.getNombre());
        existente.setDescripcion(producto.getDescripcion());
        existente.setPrecio(producto.getPrecio());
        existente.setStock(producto.getStock());
        existente.setStockMinimo(producto.getStockMinimo());
        existente.setEstado(producto.getEstado());
        if (producto.getImagen() != null && !producto.getImagen().isBlank()) {
            existente.setImagen(producto.getImagen());
        }
        existente.setCategoria(producto.getCategoria());
        existente.setMarca(producto.getMarca());
        existente.setProveedor(producto.getProveedor());

        return productoRepository.save(existente);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}