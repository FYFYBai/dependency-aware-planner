package com.example.demo.service;

import com.example.demo.dto.TaskDto;
import com.example.demo.entity.Task;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;

    public List<TaskDto> getAllByList(Long listId) {
        return taskRepo.findByListId(listId).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    public TaskDto create(Task task) {
        if (task.getName() == null || task.getName().isBlank()) {
            throw new IllegalArgumentException("Task name is required");
        }
        return ProjectMapper.toDto(taskRepo.save(task));
    }


    public TaskDto update(Long id, TaskDto dto) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setName(dto.getName());
        task.setDescription(dto.getDescription());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        return ProjectMapper.toDto(taskRepo.save(task));
    }

    public void delete(Long id) {
        taskRepo.deleteById(id);
    }
}
