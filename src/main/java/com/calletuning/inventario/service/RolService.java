package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.Rol;
import com.calletuning.inventario.repository.RolRepository;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    public Optional<Rol> buscarPorId(Long id) {
        return rolRepository.findById(id);
    }

    public Rol guardar(Rol rol) {
        return rolRepository.save(rol);
    }

    public Rol actualizar(Long id, Rol rol) {
        Rol existente = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        existente.setNombre(rol.getNombre());

        return rolRepository.save(existente);
    }

    public void eliminar(Long id) {
        rolRepository.deleteById(id);
    }
}