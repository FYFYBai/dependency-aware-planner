package com.example.demo.mapper;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.DependencyRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting entities into their DTO counterparts.
 * Includes overloads for Task mapping so dependencies can be included if needed.
 */
public class ProjectMapper {

    // Repository reference (set once at startup, see MapperConfig)
    private static DependencyRepository dependencyRepo;

    // Method for wiring in DependencyRepository
    public static void setDependencyRepo(DependencyRepository repo) {
        dependencyRepo = repo;
    }

    public static ProjectDto toDto(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt(),
                project.getLists() != null
                        ? project.getLists().stream()
                            .map(ProjectMapper::toDto)
                            .collect(Collectors.toList())
                        : null
        );
    }

    public static BoardListDto toDto(BoardList list) {
        return new BoardListDto(
                list.getId(),
                list.getName(),
                list.getPosition(),
                list.getCreatedAt(),
                list.getTasks() != null
                        ? list.getTasks().stream()
                            .map(task -> {
                                // ✅ fetch dependency IDs if repo is wired, else empty list
                                List<Long> deps = dependencyRepo != null
                                        ? dependencyRepo.findByTaskId(task.getId())
                                            .stream()
                                            .map(d -> d.getDependsOn().getId())
                                            .toList()
                                        : Collections.emptyList();
                                return ProjectMapper.toDto(task, deps);
                            })
                            .collect(Collectors.toList())
                        : null
        );
    }

    /**
     * Overload for compatibility:
     * builds a TaskDto with no dependencies (empty list).
     */
    public static TaskDto toDto(Task task) {
    return new TaskDto(
        task.getId(),
        task.getName(),
        task.getDescription(),
        task.getStartDate(),
        task.getDueDate(),
        task.getCreatedAt(),
        task.getPosition(),
        task.getList() != null ? task.getList().getId() : null,
        Collections.emptyList() // always at least []
    );
}

    /**
     * Full version: builds a TaskDto with explicit dependency IDs.
     */
    public static TaskDto toDto(Task task, List<Long> dependencyIds) {
    return new TaskDto(
        task.getId(),
        task.getName(),
        task.getDescription(),
        task.getStartDate(),
        task.getDueDate(),
        task.getCreatedAt(),
        task.getPosition(),
        task.getList() != null ? task.getList().getId() : null,
        dependencyIds != null ? dependencyIds : Collections.emptyList()
    );
}
}
