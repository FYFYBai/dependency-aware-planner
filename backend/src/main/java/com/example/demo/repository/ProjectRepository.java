package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Project;
import com.example.demo.entity.User;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId);
    List<Project> findByOwner(User owner);
    Optional<Project> findByIdAndOwner(Long id, User owner);
    
    @Query("SELECT DISTINCT p FROM Project p JOIN p.collaborators c WHERE c.user = :user")
    List<Project> findByCollaborator(@Param("user") User user);
    
    @Query("SELECT p FROM Project p WHERE p.id = :id AND (p.owner = :user OR EXISTS (SELECT 1 FROM ProjectCollaborator pc WHERE pc.project = p AND pc.user = :user))")
    Optional<Project> findByIdAndUserAccess(@Param("id") Long id, @Param("user") User user);
}
