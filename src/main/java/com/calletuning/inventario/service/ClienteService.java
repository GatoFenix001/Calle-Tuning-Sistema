package com.calletuning.inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.calletuning.inventario.entity.Cliente;
import com.calletuning.inventario.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente cliente) {
        Cliente existente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        existente.setNombre(cliente.getNombre());
        existente.setApellido(cliente.getApellido());
        existente.setDocumento(cliente.getDocumento());
        existente.setTelefono(cliente.getTelefono());
        existente.setEmail(cliente.getEmail());

        return clienteRepository.save(existente);
    }

    public void eliminar(Long id) {
        clienteRepository.deleteById(id);
    }
}