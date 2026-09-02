package com.kwan.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration.
 *
 * <p>Allowed origins are read from {@code cors.allowed-origins} in application.yml.
 * Set the {@code CORS_ALLOWED_ORIGINS} environment variable in production to
 * restrict access to your actual frontend domain(s).
 *
 * <p>The wildcard pattern ("*") is intentionally prohibited in production.
 */
@Configuration
public class CorsConfig {

    /**
     * Comma-separated list of allowed origins, e.g.:
     * {@code https://kwan.app,https://operator.kwan.app}
     */
    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:8081,http://localhost:3000,http://localhost:8080,http://127.0.0.1:8081,http://127.0.0.1:5173,http://127.0.0.1:8080}")
    private String allowedOriginsRaw;

    @Bean
    public CorsFilter corsFilter() {
        // Split comma-separated origins from config — supports Spring placeholder defaults
        List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(s -> s.trim())
                .filter(s -> !s.isBlank())
                .toList();

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin"
        ));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
