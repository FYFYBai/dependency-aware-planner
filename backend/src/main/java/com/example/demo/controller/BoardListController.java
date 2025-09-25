package com.example.demo.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.BoardListDto;
import com.example.demo.entity.BoardList;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.BoardListService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class BoardListController {

    private final BoardListService listService;
    private final UserRepository userRepo;

    @GetMapping("/project/{projectId}")
    public List<BoardListDto> getAllByProject(@PathVariable Long projectId, Authentication auth) {
        String username = auth.getName();
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return listService.getAllByProject(projectId, user);
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
