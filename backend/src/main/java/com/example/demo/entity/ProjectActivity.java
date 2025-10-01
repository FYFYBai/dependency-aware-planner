package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tracks all user activities and changes within a project for audit and history purposes.
 * Each record represents a single action performed by a user on a project entity.
 */
@Entity
@Table(name = "project_activity")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProjectActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;
    
    @Column(name = "entity_type", nullable = false)
    private String entityType;
    
    @Column(name = "entity_id")
    private Long entityId;
    
    @Column(name = "entity_name")
    private String entityName;
    
    @Column(name = "action", nullable = false)
    private String action;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;
    
    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    /**
     * Defines the types of activities that can be tracked in the system.
     * Each type corresponds to a specific user action on project entities.
     */
    public enum ActivityType {
        TASK_CREATED,
        TASK_UPDATED,
        TASK_DELETED,
        TASK_MOVED,
        LIST_CREATED,
        LIST_UPDATED,
        LIST_DELETED,
        LIST_MOVED,
        PROJECT_UPDATED,
        COLLABORATOR_INVITED,
        COLLABORATOR_JOINED,
        COLLABORATOR_LEFT,
        COLLABORATOR_ROLE_CHANGED,
        DEPENDENCY_ADDED,
        DEPENDENCY_REMOVED
    }
    
    public ProjectActivity(Project project, User user, ActivityType activityType, 
                          String entityType, Long entityId, String entityName, 
                          String action, String description) {
        this.project = project;
        this.user = user;
        this.activityType = activityType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.action = action;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }
    
    public ProjectActivity(Project project, User user, ActivityType activityType, 
                          String entityType, Long entityId, String entityName, 
                          String action, String description, String oldValues, String newValues) {
        this.project = project;
        this.user = user;
        this.activityType = activityType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.action = action;
        this.description = description;
        this.oldValues = oldValues;
        this.newValues = newValues;
        this.timestamp = LocalDateTime.now();
    }
}
