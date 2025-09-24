package com.example.demo.repository;

import com.example.demo.entity.ProjectInvitation;
import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {
    
    Optional<ProjectInvitation> findByToken(String token);
    
    List<ProjectInvitation> findByProject(Project project);
    
    List<ProjectInvitation> findByInvitedEmail(String invitedEmail);
    
    List<ProjectInvitation> findByInvitedBy(User invitedBy);
    
    @Query("SELECT pi FROM ProjectInvitation pi WHERE pi.project.id = :projectId")
    List<ProjectInvitation> findByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT pi FROM ProjectInvitation pi WHERE pi.invitedEmail = :email AND pi.status = 'PENDING'")
    List<ProjectInvitation> findPendingInvitationsByEmail(@Param("email") String email);
    
    @Query("SELECT pi FROM ProjectInvitation pi WHERE pi.project.id = :projectId AND pi.invitedEmail = :email AND pi.status = 'PENDING'")
    Optional<ProjectInvitation> findPendingInvitationByProjectAndEmail(@Param("projectId") Long projectId, @Param("email") String email);
    
    @Query("SELECT pi FROM ProjectInvitation pi WHERE pi.expiresAt < :now AND pi.status = 'PENDING'")
    List<ProjectInvitation> findExpiredInvitations(@Param("now") LocalDateTime now);
    
    @Query("SELECT pi FROM ProjectInvitation pi WHERE pi.project.id = :projectId AND pi.invitedEmail = :email")
    List<ProjectInvitation> findByProjectIdAndEmail(@Param("projectId") Long projectId, @Param("email") String email);
}
