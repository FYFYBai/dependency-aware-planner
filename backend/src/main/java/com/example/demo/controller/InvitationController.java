package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.InvitationResponseByIdRequest;
import com.example.demo.dto.ProjectCollaboratorDto;
import com.example.demo.dto.ProjectInvitationDto;
import com.example.demo.entity.ProjectInvitation;
import com.example.demo.service.ProjectCollaborationService;

import jakarta.validation.Valid;

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
            @Valid @RequestBody InvitationResponseByIdRequest request,
            Authentication authentication) {
        
        if ("accept".equalsIgnoreCase(request.getResponse())) {
            ProjectCollaboratorDto collaborator = collaborationService.acceptInvitationById(request.getId());
            return ResponseEntity.ok(collaborator);
        } else if ("decline".equalsIgnoreCase(request.getResponse())) {
            collaborationService.declineInvitationById(request.getId());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid response. Use 'accept' or 'decline'.");
        }
    }
    
    @GetMapping("/validate/{token}")
    public ResponseEntity<ProjectInvitationDto> validateInvitation(@PathVariable String token) {
        try {
            ProjectInvitation invitation = collaborationService.validateInvitationToken(token);
            return ResponseEntity.ok(ProjectInvitationDto.fromEntity(invitation));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/public/respond-by-id")
    public ResponseEntity<?> respondToInvitationById(
            @Valid @RequestBody InvitationResponseByIdRequest request) {
        
        if ("accept".equalsIgnoreCase(request.getResponse())) {
            ProjectCollaboratorDto collaborator = collaborationService.acceptInvitationById(request.getId());
            return ResponseEntity.ok(collaborator);
        } else if ("decline".equalsIgnoreCase(request.getResponse())) {
            collaborationService.declineInvitationById(request.getId());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid response. Use 'accept' or 'decline'.");
        }
    }
}
