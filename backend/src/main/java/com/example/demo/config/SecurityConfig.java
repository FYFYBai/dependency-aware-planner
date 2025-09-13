package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // disable CSRF for dev
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // allow our API
                .anyRequest().authenticated()           // everything else requires login
            )
            .formLogin(login -> login.disable()) // disable default login form
            .httpBasic(basic -> basic.disable()); // disable basic auth too

        return http.build();
    }
}
