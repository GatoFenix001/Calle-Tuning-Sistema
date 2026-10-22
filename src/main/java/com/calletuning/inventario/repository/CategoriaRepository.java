package com.calletuning.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calletuning.inventario.entity.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}