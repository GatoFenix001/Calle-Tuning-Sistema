
package com.calletuning.inventario.config;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

        @Bean
        public OncePerRequestFilter csrfCookieFilter() {
                return new OncePerRequestFilter() {

                        @Override
                        protected void doFilterInternal(
                                        HttpServletRequest request,
                                        HttpServletResponse response,
                                        jakarta.servlet.FilterChain filterChain)
                                        throws jakarta.servlet.ServletException, IOException {

                                CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");

                                if (csrfToken != null) {
                                        csrfToken.getToken();
                                }

                                filterChain.doFilter(request, response);
                        }
                };
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();

                CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();

                http
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(csrfRepository)
                                                .csrfTokenRequestHandler(csrfHandler))
                                .authorizeHttpRequests(auth -> auth

                                                // Archivos públicos de la aplicación
                                                .requestMatchers(
                                                                "/",
                                                                "/index.html",
                                                                "/registro.html",
                                                                "/login.html",
                                                                "/tienda.html",
                                                                "/confirmacion-compra.html",
                                                                "/checkout.html",
                                                                "/vendedor.html",
                                                                "/favicon.ico",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/images/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()

                                                // El registro público siempre crea usuarios CLIENTE; nunca acepta el rol del cliente.
                                                .requestMatchers(HttpMethod.POST, "/api/auth/registro-cliente").permitAll()

                                                .requestMatchers("/api/servicios-taller/**").hasAnyRole("ADMINISTRADOR", "VENDEDOR")

                                                // Gestión de usuarios y roles: solo administrador
                                                .requestMatchers(
                                                                "/api/usuarios/**",
                                                                "/api/roles/**")
                                                .hasRole("ADMINISTRADOR")
                                                // Registrar compras: solo cliente autenticado. Debe ir ANTES de la regla general POST.
                                                .requestMatchers(HttpMethod.POST, "/api/ventas/compra").hasRole("CLIENTE")

                                                // El vendedor consulta datos; las operaciones generales de escritura son exclusivas del administrador.
                                                .requestMatchers(HttpMethod.POST, "/api/**").hasRole("ADMINISTRADOR")
                                                .requestMatchers(HttpMethod.PUT, "/api/**").hasRole("ADMINISTRADOR")
                                                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMINISTRADOR")
                                                .requestMatchers(HttpMethod.PATCH, "/api/**").hasRole("ADMINISTRADOR")

                                                // Catálogo público: se puede explorar antes de iniciar sesión.
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/productos/**",
                                                                "/api/categorias/**",
                                                                "/api/marcas/**")
                                                .permitAll()

                                                // Resto de la API: administrador y vendedor
                                                .requestMatchers("/api/**")
                                                .hasAnyRole("ADMINISTRADOR", "VENDEDOR")

                                                // Las demás rutas requieren autenticación
                                                .anyRequest().authenticated())
                                .formLogin(form -> form
                                                .loginPage("/login.html")
                                                .loginProcessingUrl("/login")
                                                .usernameParameter("username")
                                                .passwordParameter("password")
                                                .successHandler((request, response, authentication) -> {

                                                        boolean esCliente = authentication.getAuthorities()
                                                                        .stream()
                                                                        .anyMatch(authority -> authority.getAuthority()
                                                                                        .equals("ROLE_CLIENTE"));

                                                        boolean esVendedor = authentication.getAuthorities().stream()
                                                                        .anyMatch(authority -> authority.getAuthority().equals("ROLE_VENDEDOR"));
                                                        if (esCliente) {
                                                                response.sendRedirect(request.getContextPath() + "/tienda.html");
                                                        } else if (esVendedor || authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"))) {
                                                                response.sendRedirect(request.getContextPath() + (esVendedor ? "/vendedor.html" : "/admin.html"));
                                                        } else {
                                                                response.sendRedirect(request.getContextPath() + "/tienda.html");
                                                        }
                                                })
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutSuccessUrl("/login.html?logout")
                                                .permitAll());
                return http.build();
        }
}
