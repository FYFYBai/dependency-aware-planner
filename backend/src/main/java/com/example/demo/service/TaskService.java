package com.example.demo.service;

import com.example.demo.dto.TaskDto;
import com.example.demo.entity.BoardList;
import com.example.demo.entity.Task;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.BoardListRepository;
import com.example.demo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final BoardListRepository listRepo;

    public List<TaskDto> getAllByList(Long listId) {
        return taskRepo.findByListId(listId).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    public TaskDto create(TaskDto dto) {
        Task task = new Task();
        task.setName(dto.getName());
        task.setDescription(dto.getDescription());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        task.setPosition(dto.getPosition());

        if (dto.getListId() != null) {
            BoardList list = listRepo.findById(dto.getListId())
                .orElseThrow(() -> new RuntimeException("List not found"));
            task.setList(list);
        }

        return ProjectMapper.toDto(taskRepo.save(task));
    }


    public TaskDto update(Long id, TaskDto dto) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

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



    public void delete(Long id) {
        taskRepo.deleteById(id);
    }
}
