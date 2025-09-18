package com.example.demo.service;

import com.example.demo.dto.ProjectDto;
import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepo;

    public List<ProjectDto> getAll() {
        return projectRepo.findAll().stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    public ProjectDto create(ProjectDto dto, User owner) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setOwner(owner); // from JWT principal
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    public ProjectDto getById(Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id " + id));
        return ProjectMapper.toDto(project);
    }
    
    public ProjectDto update(Long id, ProjectDto dto) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    public void delete(Long id) {
        projectRepo.deleteById(id);
    }
}
