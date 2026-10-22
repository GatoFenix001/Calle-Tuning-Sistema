package com.calletuning.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegistroClienteRequest {
    @NotBlank @Size(max=100) private String nombre;
    @NotBlank @Size(max=100) private String apellido;
    @NotBlank @Size(max=150) private String email;
    @NotBlank @Size(min=4, max=50) private String username;
    @NotBlank @Size(min=8, max=72) private String password;
    public String getNombre(){ return nombre; }
    public void setNombre(String nombre){ this.nombre=nombre; }
    public String getApellido(){ return apellido; }
    public void setApellido(String apellido){ this.apellido=apellido; }
    public String getEmail(){ return email; }
    public void setEmail(String email){ this.email=email; }
    public String getUsername(){ return username; }
    public void setUsername(String username){ this.username=username; }
    public String getPassword(){ return password; }
    public void setPassword(String password){ this.password=password; }
}
