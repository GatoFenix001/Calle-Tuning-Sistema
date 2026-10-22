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

import com.calletuning.inventario.entity.Proveedor;
import com.calletuning.inventario.service.ProveedorService;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> buscarPorId(@PathVariable Long id) {
        return proveedorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Proveedor guardar(@RequestBody Proveedor proveedor) {
        return proveedorService.guardar(proveedor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(
            @PathVariable Long id,
            @RequestBody Proveedor proveedor) {

        return ResponseEntity.ok(
                proveedorService.actualizar(id, proveedor)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}