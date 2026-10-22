
package com.calletuning.inventario.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.calletuning.inventario.dto.CompraRequest;
import com.calletuning.inventario.dto.CompraResponse;
import com.calletuning.inventario.service.CompraService;

@RestController
@RequestMapping("/api/ventas")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @PostMapping("/compra")
    public ResponseEntity<CompraResponse> comprar(
            @RequestBody CompraRequest solicitud,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CompraResponse respuesta = compraService.comprar(
                solicitud,
                principal.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
}
