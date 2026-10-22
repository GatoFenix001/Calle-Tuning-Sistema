package com.calletuning.inventario.controller;

import java.security.Principal;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.calletuning.inventario.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
public class PerfilController {
    private final UsuarioRepository usuarios;
    public PerfilController(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    @GetMapping("/me")
    public ResponseEntity<?> perfil(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return usuarios.findByUsername(principal.getName())
            .map(u -> ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "nombre", u.getNombre(),
                "apellido", u.getApellido(),
                "username", u.getUsername(),
                "email", u.getEmail() == null ? "" : u.getEmail(),
                "rol", u.getRol().getNombre()
            )))
            .orElseGet(() -> ResponseEntity.status(404).build());
    }
}
