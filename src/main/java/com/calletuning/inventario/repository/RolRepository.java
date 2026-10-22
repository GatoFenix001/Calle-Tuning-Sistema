package com.calletuning.inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calletuning.inventario.entity.Rol;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
}
