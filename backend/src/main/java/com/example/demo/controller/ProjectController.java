package com.example.demo.controller;

import com.example.demo.dto.ProjectDto;
import com.example.demo.entity.Project;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepo;

    @GetMapping
    public List<ProjectDto> getAll() {
        return projectRepo.findAll().stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    @PostMapping
    public ProjectDto create(@RequestBody Project project) {
        return ProjectMapper.toDto(projectRepo.save(project));
    }
}
