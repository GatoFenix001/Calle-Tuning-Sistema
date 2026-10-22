package com.calletuning.inventario.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.calletuning.inventario.entity.Rol;
import com.calletuning.inventario.service.RolService;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public List<Rol> listar() {
        return rolService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> buscarPorId(@PathVariable Long id) {
        return rolService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Rol guardar(@RequestBody Rol rol) {
        return rolService.guardar(rol);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizar(
            @PathVariable Long id,
            @RequestBody Rol rol) {

        return ResponseEntity.ok(rolService.actualizar(id, rol));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        rolService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}