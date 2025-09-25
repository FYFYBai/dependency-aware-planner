package com.example.demo.dto;

import com.example.demo.entity.ProjectInvitation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInvitationDto {
    
    private Long id;
    private Long projectId;
    private String projectName;
    private String invitedByUsername;
    private String invitedEmail;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime respondedAt;
    
    public static ProjectInvitationDto fromEntity(ProjectInvitation invitation) {
        ProjectInvitationDto dto = new ProjectInvitationDto();
        dto.setId(invitation.getId());
        dto.setProjectId(invitation.getProject().getId());
        dto.setProjectName(invitation.getProject().getName());
        dto.setInvitedByUsername(invitation.getInvitedBy().getUsername());
        dto.setInvitedEmail(invitation.getInvitedEmail());
        dto.setRole(invitation.getRole().getValue());
        dto.setStatus(invitation.getStatus().name());
        dto.setCreatedAt(invitation.getCreatedAt());
        dto.setExpiresAt(invitation.getExpiresAt());
        dto.setRespondedAt(invitation.getRespondedAt());
        return dto;
    }
}
