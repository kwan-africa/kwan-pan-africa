package com.kwan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class KwanApplication {
    public static void main(String[] args) {
        SpringApplication.run(KwanApplication.class, args);
    }
}
