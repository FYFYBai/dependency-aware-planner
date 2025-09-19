package com.example.demo.repository;

import com.example.demo.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByListId(Long listId);
    List<Task> findByProjectId(Long projectId);
    int countByListId(Long listId);
    @Query("SELECT MAX(t.position) FROM Task t WHERE t.list.id = :listId")
    Integer findMaxPositionByListId(Long listId);
}
