package com.example.demo.mapper;

import com.example.demo.dto.*;
import com.example.demo.entity.*;

import java.util.stream.Collectors;

public class ProjectMapper {

    public static ProjectDto toDto(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt(),
                project.getLists() != null
                        ? project.getLists().stream().map(ProjectMapper::toDto).collect(Collectors.toList())
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
                        ? list.getTasks().stream().map(ProjectMapper::toDto).collect(Collectors.toList())
                        : null
        );
    }

    public static TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getName(),
                task.getDescription(),
                task.getStartDate(),
                task.getDueDate(),
                task.getCreatedAt()
        );
    }
}
