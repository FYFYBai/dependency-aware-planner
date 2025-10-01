package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.entity.ProjectActivity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectActivityDto {
    private Long id;
    private Long projectId;
    private String username;
    private String userEmail;
    private String activityType;
    private String entityType;
    private Long entityId;
    private String entityName;
    private String action;
    private String description;
    private String oldValues;
    private String newValues;
    private LocalDateTime timestamp;
    
    public static ProjectActivityDto fromEntity(ProjectActivity activity) {
        ProjectActivityDto dto = new ProjectActivityDto();
        dto.setId(activity.getId());
        dto.setProjectId(activity.getProject().getId());
        dto.setUsername(activity.getUser().getUsername());
        dto.setUserEmail(activity.getUser().getEmail());
        dto.setActivityType(activity.getActivityType().name());
        dto.setEntityType(activity.getEntityType());
        dto.setEntityId(activity.getEntityId());
        dto.setEntityName(activity.getEntityName());
        dto.setAction(activity.getAction());
        dto.setDescription(activity.getDescription());
        dto.setOldValues(activity.getOldValues());
        dto.setNewValues(activity.getNewValues());
        dto.setTimestamp(activity.getTimestamp());
        return dto;
    }
}
