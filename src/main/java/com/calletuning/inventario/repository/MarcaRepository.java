package com.calletuning.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calletuning.inventario.entity.Marca;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {
}