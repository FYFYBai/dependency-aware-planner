package com.example.demo.repository;

import com.example.demo.entity.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardListRepository extends JpaRepository<BoardList, Long> {
    List<BoardList> findByProjectId(Long projectId);
}
