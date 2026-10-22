package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.Marca;
import com.calletuning.inventario.repository.MarcaRepository;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public MarcaService(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    public List<Marca> listar() {
        return marcaRepository.findAll();
    }

    public Optional<Marca> buscarPorId(Long id) {
        return marcaRepository.findById(id);
    }

    public Marca guardar(Marca marca) {
        return marcaRepository.save(marca);
    }

    public Marca actualizar(Long id, Marca marca) {
        Marca existente = marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

        existente.setNombre(marca.getNombre());

        return marcaRepository.save(existente);
    }

    public void eliminar(Long id) {
        marcaRepository.deleteById(id);
    }
}