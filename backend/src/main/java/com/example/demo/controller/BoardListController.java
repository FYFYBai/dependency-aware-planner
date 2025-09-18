package com.example.demo.controller;

import com.example.demo.dto.BoardListDto;
import com.example.demo.entity.BoardList;
import com.example.demo.service.BoardListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class BoardListController {

    private final BoardListService listService;

    @GetMapping("/project/{projectId}")
    public List<BoardListDto> getAllByProject(@PathVariable Long projectId) {
        return listService.getAllByProject(projectId);
    }

    @PostMapping
    public BoardListDto create(@RequestBody BoardList list) {
        return listService.create(list);
    }

    @PutMapping("/{id}")
    public BoardListDto update(@PathVariable Long id, @RequestBody BoardListDto dto) {
        return listService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        listService.delete(id);
    }
}
