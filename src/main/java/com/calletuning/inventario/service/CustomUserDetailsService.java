
package com.calletuning.inventario.service;

import java.util.Locale;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.Usuario;
import com.calletuning.inventario.repository.UsuarioRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + username
                ));

        if (usuario.getRol() == null
                || usuario.getRol().getNombre() == null) {
            throw new UsernameNotFoundException(
                    "El usuario no tiene un rol asignado"
            );
        }

        String nombreRol = usuario.getRol().getNombre()
                .trim()
                .toUpperCase(Locale.ROOT);

        return User.withUsername(usuario.getUsername())
                .password(usuario.getPassword())
                .roles(nombreRol)
                .disabled(!Boolean.TRUE.equals(usuario.getEstado()))
                .build();
    }
}
