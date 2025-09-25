package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.TaskDto;
import com.example.demo.entity.BoardList;
import com.example.demo.entity.Task;
import com.example.demo.entity.User;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.BoardListRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final BoardListRepository listRepo;
    private final ProjectRepository projectRepo;

    public List<TaskDto> getAllByList(Long listId, User user) {
        // First get the list to find its project
        BoardList list = listRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(list.getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        
        return taskRepo.findByListId(listId).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    public TaskDto create(TaskDto dto, User user) {
        // make sure list is attached
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
        return ProjectMapper.toDto(saved);
    }


    public TaskDto update(Long id, TaskDto dto, User user) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(task.getList().getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        if (dto.getName() != null) task.setName(dto.getName());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) task.setStartDate(dto.getStartDate());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getPosition() != null) task.setPosition(dto.getPosition());

        if (dto.getListId() != null) {
            BoardList list = listRepo.findById(dto.getListId())
                    .orElseThrow(() -> new RuntimeException("List not found"));
            task.setList(list);
        }

        return ProjectMapper.toDto(taskRepo.save(task));
    }



    public void delete(Long id, User user) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Check if user has access to the project
        projectRepo.findByIdAndUserAccess(task.getList().getProject().getId(), user)
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
        
        taskRepo.deleteById(id);
    }
}
