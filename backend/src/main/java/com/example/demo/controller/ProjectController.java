package com.example.demo.controller;

import com.example.demo.dto.ProjectDto;
import com.example.demo.entity.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.ProjectService;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectDto> getAll() {
        return projectService.getAll();
    }

    @PostMapping
    public ProjectDto create(@RequestBody Project project) {
        return projectService.create(project);
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

