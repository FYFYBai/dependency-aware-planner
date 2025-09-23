package com.example.demo.repository;

import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId);
    List<Project> findByOwner(User owner);
    Optional<Project> findByIdAndOwner(Long id, User owner);
}
