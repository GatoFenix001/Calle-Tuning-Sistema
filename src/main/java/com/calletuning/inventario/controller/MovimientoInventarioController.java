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

import com.calletuning.inventario.entity.MovimientoInventario;
import com.calletuning.inventario.service.MovimientoInventarioService;

@RestController
@RequestMapping("/api/movimientos-inventario")
public class MovimientoInventarioController {

    private final MovimientoInventarioService movimientoInventarioService;

    public MovimientoInventarioController(
            MovimientoInventarioService movimientoInventarioService) {
        this.movimientoInventarioService = movimientoInventarioService;
    }

    @GetMapping
    public List<MovimientoInventario> listar() {
        return movimientoInventarioService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoInventario> buscarPorId(
            @PathVariable Long id) {

        return movimientoInventarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MovimientoInventario guardar(
            @RequestBody MovimientoInventario movimientoInventario) {

        return movimientoInventarioService.guardar(movimientoInventario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimientoInventario> actualizar(
            @PathVariable Long id,
            @RequestBody MovimientoInventario movimientoInventario) {

        return ResponseEntity.ok(
                movimientoInventarioService.actualizar(
                        id,
                        movimientoInventario
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        movimientoInventarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}