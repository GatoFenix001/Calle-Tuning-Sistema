package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.Venta;
import com.calletuning.inventario.repository.VentaRepository;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;

    public VentaService(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    public List<Venta> listar() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> buscarPorId(Long id) {
        return ventaRepository.findById(id);
    }

    public Venta guardar(Venta venta) {
        return ventaRepository.save(venta);
    }

    public Venta actualizar(Long id, Venta venta) {
        Venta existente = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        existente.setFecha(venta.getFecha());
        existente.setTotal(venta.getTotal());
        existente.setCliente(venta.getCliente());
        existente.setUsuario(venta.getUsuario());

        return ventaRepository.save(existente);
    }

    public void eliminar(Long id) {
        ventaRepository.deleteById(id);
    }
}