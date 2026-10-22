package com.calletuning.inventario.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.calletuning.inventario.entity.OrdenServicioTaller;
public interface OrdenServicioTallerRepository extends JpaRepository<OrdenServicioTaller, Long> {
    List<OrdenServicioTaller> findAllByOrderByFechaCreacionDesc();
}
