package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ProjectDto;
import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepo;

    public List<ProjectDto> getAll() {
        return projectRepo.findAll().stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    public List<ProjectDto> getByOwner(User owner) {
        return projectRepo.findByOwner(owner).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }
    
    public List<ProjectDto> getByUser(User user) {
        // Get projects owned by user
        List<ProjectDto> ownedProjects = projectRepo.findByOwner(user).stream()
                .map(ProjectMapper::toDto)
                .toList();
        
        // Get projects where user is a collaborator
        List<ProjectDto> collaborativeProjects = projectRepo.findByCollaborator(user).stream()
                .map(ProjectMapper::toDto)
                .toList();
        
        // Combine and remove duplicates (in case user owns and collaborates on same project)
        List<ProjectDto> allProjects = new ArrayList<>(ownedProjects);
        for (ProjectDto collaborativeProject : collaborativeProjects) {
            if (ownedProjects.stream().noneMatch(p -> p.getId().equals(collaborativeProject.getId()))) {
                allProjects.add(collaborativeProject);
            }
        }
        
        return allProjects;
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

    public ProjectDto getByIdAndOwner(Long id, User owner) {
        Project project = projectRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        return ProjectMapper.toDto(project);
    }
    
    public ProjectDto getByIdAndUserAccess(Long id, User user) {
        Project project = projectRepo.findByIdAndUserAccess(id, user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        return ProjectMapper.toDto(project);
    }
    
    public ProjectDto update(Long id, ProjectDto dto) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    public ProjectDto updateByIdAndOwner(Long id, ProjectDto dto, User owner) {
        Project project = projectRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    public void delete(Long id) {
        projectRepo.deleteById(id);
    }

    public void deleteByIdAndOwner(Long id, User owner) {
        Project project = projectRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        projectRepo.delete(project);
    }
}
