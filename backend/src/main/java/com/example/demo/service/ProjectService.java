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

    /**
     * Get all projects (for admin/debug).
     * Each ProjectDto now includes lists → tasks → dependencies (thanks to ProjectMapper).
     */
    public List<ProjectDto> getAll() {
        return projectRepo.findAll().stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    /**
     * Get projects owned by a specific user.
     */
    public List<ProjectDto> getByOwner(User owner) {
        return projectRepo.findByOwner(owner).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    /**
     * Get projects a user owns OR collaborates on.
     * Removes duplicates if the user is both owner and collaborator.
     */
    public List<ProjectDto> getByUser(User user) {
        // Owned projects
        List<ProjectDto> ownedProjects = projectRepo.findByOwner(user).stream()
                .map(ProjectMapper::toDto)
                .toList();

        // Collaborative projects
        List<ProjectDto> collaborativeProjects = projectRepo.findByCollaborator(user).stream()
                .map(ProjectMapper::toDto)
                .toList();

        // Merge without duplicates
        List<ProjectDto> allProjects = new ArrayList<>(ownedProjects);
        for (ProjectDto collaborativeProject : collaborativeProjects) {
            if (ownedProjects.stream().noneMatch(p -> p.getId().equals(collaborativeProject.getId()))) {
                allProjects.add(collaborativeProject);
            }
        }

        return allProjects;
    }

    /**
     * Create a new project owned by the given user.
     */
    public ProjectDto create(ProjectDto dto, User owner) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setOwner(owner); // from JWT principal
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    /**
     * Get project by id (no access control).
     */
    public ProjectDto getById(Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id " + id));
        return ProjectMapper.toDto(project);
    }

    /**
     * Get project by id and owner (ensures ownership).
     */
    public ProjectDto getByIdAndOwner(Long id, User owner) {
        Project project = projectRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        return ProjectMapper.toDto(project);
    }

    /**
     * Get project by id with user access check (owner or collaborator).
     */
    public ProjectDto getByIdAndUserAccess(Long id, User user) {
        Project project = projectRepo.findByIdAndUserAccess(id, user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        return ProjectMapper.toDto(project);
    }

    /**
     * Update project name/description.
     */
    public ProjectDto update(Long id, ProjectDto dto) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    /**
     * Update project by id and owner (ownership enforced).
     */
    public ProjectDto updateByIdAndOwner(Long id, ProjectDto dto, User owner) {
        Project project = projectRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        return ProjectMapper.toDto(projectRepo.save(project));
    }

    /**
     * Delete project by id (no access control).
     */
    public void delete(Long id) {
        projectRepo.deleteById(id);
    }

    /**
     * Delete project by id and owner (ownership enforced).
     */
    public void deleteByIdAndOwner(Long id, User owner) {
        Project project = projectRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        projectRepo.delete(project);
    }
}
