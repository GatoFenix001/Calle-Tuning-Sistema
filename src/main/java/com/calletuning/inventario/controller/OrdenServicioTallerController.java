package com.calletuning.inventario.controller;

import java.security.Principal;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.calletuning.inventario.entity.OrdenServicioTaller;
import com.calletuning.inventario.repository.OrdenServicioTallerRepository;

@RestController
@RequestMapping("/api/servicios-taller")
public class OrdenServicioTallerController {
    private final OrdenServicioTallerRepository repository;
    private static final Set<String> TIPOS = Set.of("TUNING","CALIBRACION","MANTENIMIENTO","REPARACION");
    private static final Set<String> ESTADOS = Set.of("PENDIENTE","EN_PROCESO","FINALIZADO","CANCELADO");
    public OrdenServicioTallerController(OrdenServicioTallerRepository repository){this.repository=repository;}

    @GetMapping public List<OrdenServicioTaller> listar(){return repository.findAllByOrderByFechaCreacionDesc();}

    @PostMapping public OrdenServicioTaller crear(@RequestBody OrdenServicioTaller orden, Principal principal){
        if(principal==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if(orden.getCliente()==null || orden.getCliente().isBlank() || orden.getVehiculo()==null || orden.getVehiculo().isBlank() || orden.getTipoServicio()==null || !TIPOS.contains(orden.getTipoServicio().toUpperCase()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Completa cliente, vehículo y tipo de servicio.");
        orden.setTipoServicio(orden.getTipoServicio().toUpperCase());
        orden.setEstado("PENDIENTE");
        orden.setVendedorUsername(principal.getName());
        orden.setFechaCreacion(java.time.LocalDateTime.now());
        return repository.save(orden);
    }
    @PatchMapping("/{id}/estado") public OrdenServicioTaller actualizarEstado(@PathVariable Long id,@RequestBody EstadoRequest req){
        if(req==null || req.estado==null || !ESTADOS.contains(req.estado.toUpperCase())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Estado inválido.");
        OrdenServicioTaller o=repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        o.setEstado(req.estado.toUpperCase()); return repository.save(o);
    }
    public static class EstadoRequest { public String estado; }
}
