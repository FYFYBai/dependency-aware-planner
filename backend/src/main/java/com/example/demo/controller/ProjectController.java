package com.example.demo.controller;

import com.example.demo.dto.ProjectDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.example.demo.service.ProjectService;
import java.util.List;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;


@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepo;

    @GetMapping
    public List<ProjectDto> getAll() {
        return projectService.getAll();
    }

    @PostMapping
    public ProjectDto create(@RequestBody ProjectDto dto, Authentication auth) {
        String username = auth.getName(); // from JWT principal
        User owner = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return projectService.create(dto, owner);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }


    @PutMapping("/{id}")
    public ProjectDto update(@PathVariable Long id, @RequestBody ProjectDto dto) {
        return projectService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }
}

