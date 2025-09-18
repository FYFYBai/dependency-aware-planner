package com.example.demo.controller;

import com.example.demo.dto.TaskDto;
import com.example.demo.entity.Task;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepo;

    @GetMapping
    public List<TaskDto> getAll() {
        return taskRepo.findAll().stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    @GetMapping("/list/{listId}")
    public List<TaskDto> getTasksByList(@PathVariable Long listId) {
        return taskRepo.findByListId(listId).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }


    @PostMapping
    public TaskDto create(@RequestBody Task task) {
        return ProjectMapper.toDto(taskRepo.save(task));
    }

    @PutMapping("/{id}")
    public TaskDto update(@PathVariable Long id, @RequestBody Task updated) {
        return taskRepo.findById(id)
                .map(task -> {
                    task.setName(updated.getName());
                    task.setDescription(updated.getDescription());
                    task.setList(updated.getList()); // move task
                    return ProjectMapper.toDto(taskRepo.save(task));
                })
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }
}
