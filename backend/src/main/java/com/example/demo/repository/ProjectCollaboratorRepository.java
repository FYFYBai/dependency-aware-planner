package com.example.demo.repository;

import com.example.demo.entity.ProjectCollaborator;
import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectCollaboratorRepository extends JpaRepository<ProjectCollaborator, Long> {
    
    List<ProjectCollaborator> findByProject(Project project);
    
    List<ProjectCollaborator> findByUser(User user);
    
    Optional<ProjectCollaborator> findByProjectAndUser(Project project, User user);
    
    boolean existsByProjectAndUser(Project project, User user);
    
    @Query("SELECT pc FROM ProjectCollaborator pc WHERE pc.project.id = :projectId AND pc.user.id = :userId")
    Optional<ProjectCollaborator> findByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);
    
    @Query("SELECT pc FROM ProjectCollaborator pc WHERE pc.project.id = :projectId")
    List<ProjectCollaborator> findByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT pc FROM ProjectCollaborator pc WHERE pc.user.id = :userId")
    List<ProjectCollaborator> findByUserId(@Param("userId") Long userId);
    
    void deleteByProjectAndUser(Project project, User user);
}
