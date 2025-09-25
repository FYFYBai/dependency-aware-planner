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
 * REST controller for handling project invitation responses.
 * Allows users to view and respond to their pending invitations.
 */
@RestController
@RequestMapping("/api/invitations")
@CrossOrigin(origins = "http://localhost:5173")
public class InvitationController {
    
    @Autowired
    private ProjectCollaborationService collaborationService;
    
    @GetMapping("/my-invitations")
    public ResponseEntity<List<ProjectInvitationDto>> getMyInvitations(Authentication authentication) {
        String username = authentication.getName();
        List<ProjectInvitationDto> invitations = collaborationService.getUserInvitations(username);
        return ResponseEntity.ok(invitations);
    }
    
    @PostMapping("/respond")
    public ResponseEntity<?> respondToInvitation(
            @Valid @RequestBody InvitationResponseRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if ("accept".equalsIgnoreCase(request.getResponse())) {
            ProjectCollaboratorDto collaborator = collaborationService.acceptInvitation(request.getToken(), username);
            return ResponseEntity.ok(collaborator);
        } else if ("decline".equalsIgnoreCase(request.getResponse())) {
            collaborationService.declineInvitation(request.getToken(), username);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid response. Use 'accept' or 'decline'.");
        }
    }
    
    @GetMapping("/validate/{token}")
    public ResponseEntity<ProjectInvitationDto> validateInvitation(@PathVariable String token) {
        return ResponseEntity.ok().build();
    }
}
