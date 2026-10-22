package com.calletuning.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calletuning.inventario.entity.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
}