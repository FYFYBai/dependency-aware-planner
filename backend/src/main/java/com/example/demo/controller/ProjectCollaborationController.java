package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.ProjectCollaborationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for project collaboration management.
 * Handles invitations, collaborator management, and access control.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/collaboration")
@CrossOrigin(origins = "*")
public class ProjectCollaborationController {
    
    @Autowired
    private ProjectCollaborationService collaborationService;
    
    @PostMapping("/invite")
    public ResponseEntity<ProjectInvitationDto> inviteUser(
            @PathVariable Long projectId,
            @Valid @RequestBody InviteUserRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        ProjectInvitationDto invitation = collaborationService.inviteUser(projectId, username, request);
        return ResponseEntity.ok(invitation);
    }
    
    @GetMapping("/collaborators")
    public ResponseEntity<List<ProjectCollaboratorDto>> getCollaborators(@PathVariable Long projectId) {
        List<ProjectCollaboratorDto> collaborators = collaborationService.getProjectCollaborators(projectId);
        return ResponseEntity.ok(collaborators);
    }
    
    @GetMapping("/invitations")
    public ResponseEntity<List<ProjectInvitationDto>> getInvitations(@PathVariable Long projectId) {
        List<ProjectInvitationDto> invitations = collaborationService.getProjectInvitations(projectId);
        return ResponseEntity.ok(invitations);
    }
    
    @DeleteMapping("/collaborators/{userId}")
    public ResponseEntity<Void> removeCollaborator(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            Authentication authentication) {
        
        String username = authentication.getName();
        collaborationService.removeCollaborator(projectId, userId, username);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/check-access")
    public ResponseEntity<Boolean> checkAccess(
            @PathVariable Long projectId,
            Authentication authentication) {
        
        String username = authentication.getName();
        boolean hasAccess = collaborationService.isProjectCollaborator(projectId, username);
        return ResponseEntity.ok(hasAccess);
    }
}
