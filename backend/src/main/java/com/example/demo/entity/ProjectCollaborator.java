package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a user's collaboration on a project with a specific role.
 * Tracks who invited them and when they joined.
 */
@Entity
@Table(name = "project_collaborator")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProjectCollaborator {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy;
    
    @Column(name = "role", nullable = false, length = 255)
    private String role;
    
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();
    
    // Constructor for creating a new collaborator
    public ProjectCollaborator(Project project, User user, User invitedBy, String role) {
        this.project = project;
        this.user = user;
        this.invitedBy = invitedBy;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }
}
