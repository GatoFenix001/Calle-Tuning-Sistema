package com.calletuning.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calletuning.inventario.entity.MovimientoInventario;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
}