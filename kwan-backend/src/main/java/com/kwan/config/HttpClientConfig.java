package com.kwan.config;

import okhttp3.OkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Shared OkHttpClient singleton.
 *
 * <p>All services share a single connection pool and thread pool instead of
 * creating per-service instances. This reduces resource consumption under load
 * and allows connection reuse across Gemini, Paystack, and Google Places calls.
 */
@Configuration
public class HttpClientConfig {

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(60))
                .writeTimeout(Duration.ofSeconds(30))
                .callTimeout(Duration.ofSeconds(120))
                .build();
    }
}
