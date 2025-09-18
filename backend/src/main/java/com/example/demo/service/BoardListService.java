package com.example.demo.service;

import com.example.demo.dto.BoardListDto;
import com.example.demo.entity.BoardList;
import com.example.demo.mapper.ProjectMapper;
import com.example.demo.repository.BoardListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardListService {

    private final BoardListRepository listRepo;

public List<BoardListDto> getAllByProject(Long projectId) {
    return listRepo.findByProjectIdOrderByPositionAsc(projectId)
                   .stream()
                   .map(ProjectMapper::toDto)
                   .toList();
}


    public BoardListDto create(BoardList list) {
        // auto-set position
        int nextPosition = listRepo.findByProjectIdOrderByPositionAsc(list.getProject().getId()).size() + 1;
        list.setPosition(nextPosition);
        return ProjectMapper.toDto(listRepo.save(list));
    }


    public BoardListDto update(Long id, BoardListDto dto) {
        BoardList list = listRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found"));
        list.setName(dto.getName());
        list.setPosition(dto.getPosition());
        return ProjectMapper.toDto(listRepo.save(list));
    }

    public void delete(Long id) {
        listRepo.deleteById(id);
    }
}
