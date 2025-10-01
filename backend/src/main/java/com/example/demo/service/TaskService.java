package com.example.demo.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.TaskDto;
import com.example.demo.entity.BoardList;
import com.example.demo.entity.Task;
import com.example.demo.entity.User;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.BoardListRepository;
import com.example.demo.repository.DependencyRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service for managing task operations including CRUD operations and activity logging.
 * Integrates with ProjectActivityService to track all task-related changes for audit purposes.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final BoardListRepository listRepo;
    private final ProjectRepository projectRepo;
    private final DependencyRepository dependencyRepo; // inject repo
    private final ProjectActivityService activityService;

    public List<TaskDto> getAllByList(Long listId, User user) {
        // First get the list to find its project
        BoardList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(list.getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        return taskRepo.findByListId(listId).stream()
                .map(task -> {
                    List<Long> deps = dependencyRepo.findByTaskId(task.getId())
                            .stream()
                            .map(d -> d.getDependsOn().getId())
                            .toList();
                    return ProjectMapper.toDto(task, deps);
                })
                .toList();
    }

    /**
     * Creates a new task and logs the creation activity.
     * Automatically sets position if not provided and validates project access.
     */
    public TaskDto create(TaskDto dto, User user) {
        if (dto.getListId() == null) {
            throw new IllegalArgumentException("Task must belong to a list");
        }

        BoardList list = listRepo.findById(dto.getListId())
                .orElseThrow(() -> new RuntimeException("List not found"));

        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(list.getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        Task task = new Task();
        task.setName(dto.getName());
        task.setDescription(dto.getDescription());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());

        // Handle position default
        if (dto.getPosition() != null) {
            task.setPosition(dto.getPosition());
        } else {
            Integer maxPosition = taskRepo.findMaxPositionByListId(dto.getListId());
            task.setPosition(maxPosition == null ? 0 : maxPosition + 1);
        }

        task.setList(list);

        Task saved = taskRepo.save(task);

        activityService.logTaskCreated(list.getProject().getId(), user.getUsername(), 
                                      saved.getId(), saved.getName());

        // fetch empty deps (new task)
        return ProjectMapper.toDto(saved, Collections.emptyList());
    }

    /**
     * Updates an existing task and logs the activity with old/new values.
     * Handles task movement between lists and tracks all field changes.
     */
    public TaskDto update(Long id, TaskDto dto, User user) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(task.getList().getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        String oldValues = String.format("{\"name\":\"%s\",\"description\":\"%s\",\"startDate\":\"%s\",\"dueDate\":\"%s\",\"position\":%d,\"listId\":%d}", 
                                        task.getName(), task.getDescription(), task.getStartDate(), task.getDueDate(), task.getPosition(), task.getList().getId());

        if (dto.getName() != null) task.setName(dto.getName());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) task.setStartDate(dto.getStartDate());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getPosition() != null) task.setPosition(dto.getPosition());

        boolean movedToList = false;
        String fromListName = task.getList().getName();
        if (dto.getListId() != null) {
            BoardList list = listRepo.findById(dto.getListId())
                    .orElseThrow(() -> new RuntimeException("List not found"));
            task.setList(list);
            movedToList = true;
        }

        Task saved = taskRepo.save(task);

        String newValues = String.format("{\"name\":\"%s\",\"description\":\"%s\",\"startDate\":\"%s\",\"dueDate\":\"%s\",\"position\":%d,\"listId\":%d}", 
                                        saved.getName(), saved.getDescription(), saved.getStartDate(), saved.getDueDate(), saved.getPosition(), saved.getList().getId());
        if (movedToList) {
            activityService.logTaskMoved(task.getList().getProject().getId(), user.getUsername(), 
                                        saved.getId(), saved.getName(), fromListName, saved.getList().getName());
        } else {
            activityService.logTaskUpdated(task.getList().getProject().getId(), user.getUsername(), 
                                          saved.getId(), saved.getName(), oldValues, newValues);
        }

        List<Long> deps = dependencyRepo.findByTaskId(saved.getId())
                .stream()
                .map(d -> d.getDependsOn().getId())
                .toList();

        return ProjectMapper.toDto(saved, deps);
    }

    /**
     * Deletes a task and logs the deletion activity.
     * Validates project access before performing the deletion.
     */
    public void delete(Long id, User user) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(task.getList().getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        activityService.logTaskDeleted(task.getList().getProject().getId(), user.getUsername(), 
                                      task.getId(), task.getName());

        taskRepo.deleteById(id);
    }
}
