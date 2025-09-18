package com.example.demo.controller;

import com.example.demo.dto.BoardListDto;
import com.example.demo.entity.BoardList;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.BoardListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class BoardListController {

    private final BoardListRepository listRepo;

    @GetMapping
    public List<BoardListDto> getAll() {
        return listRepo.findAll().stream()
                .map(ProjectMapper::toDto)
                .toList();
    }
    
    @GetMapping("/project/{projectId}")
    public List<BoardListDto> getListsByProject(@PathVariable Long projectId) {
        return listRepo.findByProjectId(projectId).stream()
                .map(ProjectMapper::toDto)
                .toList();
    }

    @PostMapping
    public BoardListDto create(@RequestBody BoardList list) {
        return ProjectMapper.toDto(listRepo.save(list));
    }
}
