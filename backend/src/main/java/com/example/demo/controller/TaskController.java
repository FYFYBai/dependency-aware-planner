package com.example.demo.controller;

import com.example.demo.dto.TaskDto;
import com.example.demo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/list/{listId}")
    public List<TaskDto> getAllByList(@PathVariable Long listId) {
        return taskService.getAllByList(listId);
    }

    @PostMapping
    public TaskDto create(@RequestBody TaskDto dto) {
        System.out.println(">>> Received JSON task DTO: " + dto);
        return taskService.create(dto);
    }



    @PutMapping("/{id}")
    public TaskDto update(@PathVariable Long id, @RequestBody TaskDto dto) {
        return taskService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }
}
