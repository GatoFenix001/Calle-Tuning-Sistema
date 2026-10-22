package com.calletuning.inventario.entity;
 
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "orden_servicio_taller")
public class OrdenServicioTaller {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, length=100) private String cliente;
    @Column(nullable=false, length=120) private String vehiculo;
    @Column(name="tipo_servicio", nullable=false, length=30) private String tipoServicio;
    @Column(length=1000) private String descripcion;
    @Column(nullable=false, length=30) private String estado = "PENDIENTE";
    @Column(name="vendedor_username", nullable=false, length=50) private String vendedorUsername;
    @Column(nullable=false) private LocalDateTime fechaCreacion = LocalDateTime.now();
    public OrdenServicioTaller() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getCliente(){return cliente;} public void setCliente(String v){cliente=v;}
    public String getVehiculo(){return vehiculo;} public void setVehiculo(String v){vehiculo=v;}
    public String getTipoServicio(){return tipoServicio;} public void setTipoServicio(String v){tipoServicio=v;}
    public String getDescripcion(){return descripcion;} public void setDescripcion(String v){descripcion=v;}
    public String getEstado(){return estado;} public void setEstado(String v){estado=v;}
    public String getVendedorUsername(){return vendedorUsername;} public void setVendedorUsername(String v){vendedorUsername=v;}
    public LocalDateTime getFechaCreacion(){return fechaCreacion;} public void setFechaCreacion(LocalDateTime v){fechaCreacion=v;}
}