package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.calletuning.inventario.entity.Usuario;
import com.calletuning.inventario.repository.UsuarioRepository;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardar(Usuario usuario) {
        if (usuario.getPassword() == null
                || usuario.getPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "La contraseña es obligatoria");
        }

        usuario.setPassword(
                passwordEncoder.encode(usuario.getPassword()));

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario usuario) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        existente.setNombre(usuario.getNombre());
        existente.setApellido(usuario.getApellido());
        existente.setUsername(usuario.getUsername());
        existente.setEstado(usuario.getEstado());
        existente.setRol(usuario.getRol());

        if (usuario.getPassword() != null
                && !usuario.getPassword().isBlank()) {
            existente.setPassword(
                    passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioRepository.save(existente);
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
}
