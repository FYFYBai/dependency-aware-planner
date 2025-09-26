package com.example.demo.config;

import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.DependencyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Wires DependencyRepository into ProjectMapper at startup.
 * This ensures BoardListDto → TaskDto mappings include dependencies automatically.
 */
@Component
@RequiredArgsConstructor
public class MapperConfig {

    private final DependencyRepository dependencyRepo;

    @PostConstruct
    public void init() {
        ProjectMapper.setDependencyRepo(dependencyRepo);
    }
}
