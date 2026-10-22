package com.calletuning.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calletuning.inventario.entity.Proveedor;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
}