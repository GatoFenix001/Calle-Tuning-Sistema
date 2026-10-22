package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.MovimientoInventario;
import com.calletuning.inventario.repository.MovimientoInventarioRepository;

@Service
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public MovimientoInventarioService(
            MovimientoInventarioRepository movimientoInventarioRepository) {
        this.movimientoInventarioRepository = movimientoInventarioRepository;
    }

    public List<MovimientoInventario> listar() {
        return movimientoInventarioRepository.findAll();
    }

    public Optional<MovimientoInventario> buscarPorId(Long id) {
        return movimientoInventarioRepository.findById(id);
    }

    public MovimientoInventario guardar(MovimientoInventario movimiento) {
        return movimientoInventarioRepository.save(movimiento);
    }

    public MovimientoInventario actualizar(Long id,
                                           MovimientoInventario movimiento) {

        MovimientoInventario existente =
                movimientoInventarioRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Movimiento de inventario no encontrado"));

        existente.setTipoMovimiento(movimiento.getTipoMovimiento());
        existente.setCantidad(movimiento.getCantidad());
        existente.setFecha(movimiento.getFecha());
        existente.setMotivo(movimiento.getMotivo());
        existente.setProducto(movimiento.getProducto());
        existente.setUsuario(movimiento.getUsuario());

        return movimientoInventarioRepository.save(existente);
    }

    public void eliminar(Long id) {
        movimientoInventarioRepository.deleteById(id);
    }
}