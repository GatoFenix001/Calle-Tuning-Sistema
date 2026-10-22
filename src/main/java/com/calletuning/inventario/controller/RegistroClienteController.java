package com.calletuning.inventario.controller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.calletuning.inventario.dto.RegistroClienteRequest;
import com.calletuning.inventario.entity.Rol;
import com.calletuning.inventario.entity.Usuario;
import com.calletuning.inventario.repository.RolRepository;
import com.calletuning.inventario.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
public class RegistroClienteController {
    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PasswordEncoder encoder;
    public RegistroClienteController(UsuarioRepository usuarios, RolRepository roles, PasswordEncoder encoder) {
        this.usuarios=usuarios; this.roles=roles; this.encoder=encoder;
    }
    @PostMapping("/registro-cliente")
    public ResponseEntity<?> registrar(@RequestBody RegistroClienteRequest req) {
        if (req.getNombre()==null || req.getNombre().isBlank() || req.getApellido()==null || req.getApellido().isBlank() || req.getEmail()==null || !req.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") || req.getUsername()==null || req.getUsername().isBlank() || req.getPassword()==null || req.getPassword().length()<8) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Completa todos los campos. La contraseña debe tener al menos 8 caracteres."));
        }
        String username=req.getUsername().trim();
        String email=req.getEmail().trim().toLowerCase();
        if (usuarios.findAll().stream().anyMatch(u -> email.equalsIgnoreCase(u.getEmail()))) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese correo ya está registrado."));
        if (usuarios.findByUsername(username).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese usuario ya está registrado."));
        Rol cliente=roles.findAll().stream().filter(r -> "CLIENTE".equalsIgnoreCase(r.getNombre().trim())).findFirst().orElse(null);
        if (cliente==null) return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("mensaje", "No existe el rol CLIENTE. Solicita al administrador que lo configure."));
        Usuario usuario=new Usuario();
        usuario.setNombre(req.getNombre().trim()); usuario.setApellido(req.getApellido().trim()); usuario.setUsername(username); usuario.setEmail(email);
        usuario.setPassword(encoder.encode(req.getPassword())); usuario.setEstado(true); usuario.setRol(cliente);
        usuarios.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Cuenta de cliente creada correctamente. Ya puedes iniciar sesión."));
    }
}
