package com.example.demo.dto;

import com.example.demo.entity.ProjectCollaborator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCollaboratorDto {
    
    private Long id;
    private Long projectId;
    private String projectName;
    private Long userId;
    private String username;
    private String userEmail;
    private String role;
    private String invitedByUsername;
    private LocalDateTime joinedAt;
    
    public static ProjectCollaboratorDto fromEntity(ProjectCollaborator collaborator) {
        ProjectCollaboratorDto dto = new ProjectCollaboratorDto();
        dto.setId(collaborator.getId());
        dto.setProjectId(collaborator.getProject().getId());
        dto.setProjectName(collaborator.getProject().getName());
        dto.setUserId(collaborator.getUser().getId());
        dto.setUsername(collaborator.getUser().getUsername());
        dto.setUserEmail(collaborator.getUser().getEmail());
        dto.setRole(collaborator.getRole());
        dto.setInvitedByUsername(collaborator.getInvitedBy().getUsername());
        dto.setJoinedAt(collaborator.getJoinedAt());
        return dto;
    }
}
