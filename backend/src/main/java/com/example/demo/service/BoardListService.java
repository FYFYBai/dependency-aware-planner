package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.BoardListDto;
import com.example.demo.entity.BoardList;
import com.example.demo.entity.User;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.BoardListRepository;
import com.example.demo.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service for managing board lists including CRUD operations and activity logging.
 * Handles list creation, updates, deletion, and position management.
 */
@Service
@RequiredArgsConstructor
public class BoardListService {

    private final BoardListRepository listRepo;
    private final ProjectRepository projectRepo;
    private final ProjectActivityService activityService;

public List<BoardListDto> getAllByProject(Long projectId, User user) {
    // Check if user has access to the project
    projectRepo.findByIdAndUserAccess(projectId, user)
            .orElseThrow(() -> new RuntimeException("Project not found or access denied"));
    
    return listRepo.findByProjectIdOrderByPositionAsc(projectId)
                   .stream()
                   .map(ProjectMapper::toDto)
                   .toList();
}


    public BoardListDto create(BoardList list, User user) {
        // auto-set position
        int nextPosition = listRepo.findByProjectIdOrderByPositionAsc(list.getProject().getId()).size() + 1;
        list.setPosition(nextPosition);
        BoardList saved = listRepo.save(list);
        
        activityService.logListCreated(list.getProject().getId(), user.getUsername(), 
                                     saved.getId(), saved.getName());
        
        return ProjectMapper.toDto(saved);
    }


    public BoardListDto update(Long id, BoardListDto dto, User user) {
        BoardList list = listRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        String oldValues = String.format("{\"name\":\"%s\",\"position\":%d}", list.getName(), list.getPosition());
        
        list.setName(dto.getName());
        list.setPosition(dto.getPosition());
        BoardList saved = listRepo.save(list);
        
        String newValues = String.format("{\"name\":\"%s\",\"position\":%d}", saved.getName(), saved.getPosition());
        
        activityService.logListUpdated(list.getProject().getId(), user.getUsername(), 
                                     saved.getId(), saved.getName(), oldValues, newValues);
        
        return ProjectMapper.toDto(saved);
    }

    public void delete(Long id, User user) {
        BoardList list = listRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        activityService.logListDeleted(list.getProject().getId(), user.getUsername(), 
                                     list.getId(), list.getName());
        
        listRepo.deleteById(id);
    }
}
