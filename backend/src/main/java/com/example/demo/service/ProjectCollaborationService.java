package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.InviteUserRequest;
import com.example.demo.dto.ProjectCollaboratorDto;
import com.example.demo.dto.ProjectInvitationDto;
import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectCollaborator;
import com.example.demo.entity.ProjectInvitation;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.ProjectCollaboratorRepository;
import com.example.demo.repository.ProjectInvitationRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;

/**
 * Service for managing project collaboration including invitations, collaborator management,
 * and activity logging for all collaboration-related actions.
 */
@Service
@Transactional
public class ProjectCollaborationService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectCollaboratorRepository collaboratorRepository;
    
    @Autowired
    private ProjectInvitationRepository invitationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ProjectActivityService activityService;
    
    /**
     * Invites a user to collaborate on a project and logs the invitation activity.
     * Validates permissions and prevents duplicate invitations.
     */
    public ProjectInvitationDto inviteUser(Long projectId, String inviterUsername, InviteUserRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User inviter = userRepository.findByUsername(inviterUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!isProjectOwnerOrAdmin(project, inviter)) {
            throw new RuntimeException("You don't have permission to invite users to this project");
        }
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            if (collaboratorRepository.existsByProjectAndUser(project, existingUser.get())) {
                throw new RuntimeException("User is already a collaborator on this project");
            }
        }
        
        Optional<ProjectInvitation> existingInvitation = invitationRepository
                .findPendingInvitationByProjectAndEmail(projectId, request.getEmail());
        if (existingInvitation.isPresent()) {
            throw new RuntimeException("There's already a pending invitation for this email");
        }
        
        Role role = Role.fromValue(request.getRole());
        ProjectInvitation invitation = new ProjectInvitation(
                project, inviter, request.getEmail(), role, request.getExpirationHours()
        );
        
        invitation = invitationRepository.save(invitation);
        
        activityService.logCollaboratorInvited(projectId, inviterUsername, 
                                              request.getEmail(), request.getRole());
        
        try {
            emailService.sendProjectInvitationEmail(invitation);
        } catch (Exception e) {
            System.err.println("Failed to send invitation email: " + e.getMessage());
        }
        
        return ProjectInvitationDto.fromEntity(invitation);
    }
    
    /**
     * Accepts a project invitation and logs the collaboration activity.
     * Validates the invitation token and user email before creating the collaboration.
     */
    public ProjectCollaboratorDto acceptInvitation(String token, String username) {
        ProjectInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
        
        if (!invitation.isPending()) {
            throw new RuntimeException("Invitation is no longer valid");
        }
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getEmail().equals(invitation.getInvitedEmail())) {
            throw new RuntimeException("This invitation is not for your email address");
        }
        
        invitation.accept();
        invitationRepository.save(invitation);
        ProjectCollaborator collaborator = new ProjectCollaborator(
                invitation.getProject(), user, invitation.getInvitedBy(), invitation.getRole()
        );
        collaborator = collaboratorRepository.save(collaborator);
        
        activityService.logCollaboratorJoined(invitation.getProject().getId(), username, 
                                             invitation.getRole().name());
        
        return ProjectCollaboratorDto.fromEntity(collaborator);
    }
    
    public void declineInvitation(String token, String username) {
        ProjectInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
        
        if (!invitation.isPending()) {
            throw new RuntimeException("Invitation is no longer valid");
        }
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getEmail().equals(invitation.getInvitedEmail())) {
            throw new RuntimeException("This invitation is not for your email address");
        }
        invitation.decline();
        invitationRepository.save(invitation);
    }
    
    public List<ProjectCollaboratorDto> getProjectCollaborators(Long projectId) {
        List<ProjectCollaborator> collaborators = collaboratorRepository.findByProjectId(projectId);
        return collaborators.stream()
                .map(ProjectCollaboratorDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ProjectInvitationDto> getProjectInvitations(Long projectId) {
        List<ProjectInvitation> invitations = invitationRepository.findByProjectId(projectId);
        return invitations.stream()
                .map(ProjectInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ProjectInvitationDto> getUserInvitations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ProjectInvitation> invitations = invitationRepository.findPendingInvitationsByEmail(user.getEmail());
        return invitations.stream()
                .map(ProjectInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Removes a collaborator from a project and logs the removal activity.
     * Prevents removal of project owners and validates requester permissions.
     */
    public void removeCollaborator(Long projectId, Long userId, String requesterUsername) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!isProjectOwnerOrAdmin(project, requester)) {
            throw new RuntimeException("You don't have permission to remove collaborators");
        }
        
        // Don't allow removing the project owner
        if (project.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove project owner");
        }
        
        Optional<ProjectCollaborator> collaborator = collaboratorRepository
                .findByProjectIdAndUserId(projectId, userId);
        
        if (collaborator.isPresent()) {
            activityService.logCollaboratorLeft(projectId, requesterUsername, 
                                              collaborator.get().getUser().getUsername());
            collaboratorRepository.delete(collaborator.get());
        }
    }
    
    public boolean isProjectCollaborator(Long projectId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        return project.getOwner().getId().equals(user.getId()) || 
               collaboratorRepository.existsByProjectAndUser(project, user);
    }
    
    public boolean isProjectOwnerOrAdmin(Project project, User user) {
        // Project owner has full access
        if (project.getOwner().getId().equals(user.getId())) {
            return true;
        }
        
        // Check if user is a collaborator with admin role
        Optional<ProjectCollaborator> collaborator = collaboratorRepository
                .findByProjectAndUser(project, user);
        
        return collaborator.isPresent() && collaborator.get().getRole() == Role.ADMIN;
    }
    
    public void cleanupExpiredInvitations() {
        List<ProjectInvitation> expiredInvitations = invitationRepository
                .findExpiredInvitations(LocalDateTime.now());
        
        for (ProjectInvitation invitation : expiredInvitations) {
            invitation.setStatus(ProjectInvitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
        }
    }
    
    /**
     * Validate invitation token (for public access)
     */
    public ProjectInvitation validateInvitationToken(String token) {
        ProjectInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
        
        if (!invitation.isPending()) {
            throw new RuntimeException("Invitation is no longer valid");
        }
        
        return invitation;
    }
    
    /**
     * Accept invitation using invitation ID (for public access)
     */
    public ProjectCollaboratorDto acceptInvitationById(Long invitationId) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invalid invitation ID"));
        
        if (!invitation.isPending()) {
            throw new RuntimeException("Invitation is no longer valid");
        }
        
        // Find user by email from the invitation
        User user = userRepository.findByEmail(invitation.getInvitedEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + invitation.getInvitedEmail()));
        
        // Check if user is already a collaborator
        if (collaboratorRepository.existsByProjectAndUser(invitation.getProject(), user)) {
            throw new RuntimeException("User is already a collaborator on this project");
        }
        
        invitation.accept();
        invitationRepository.save(invitation);
        ProjectCollaborator collaborator = new ProjectCollaborator(
                invitation.getProject(), user, invitation.getInvitedBy(), invitation.getRole()
        );
        collaborator = collaboratorRepository.save(collaborator);
        
        return ProjectCollaboratorDto.fromEntity(collaborator);
    }
    
    /**
     * Decline invitation using invitation ID (for public access)
     */
    public void declineInvitationById(Long invitationId) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invalid invitation ID"));
        
        if (!invitation.isPending()) {
            throw new RuntimeException("Invitation is no longer valid");
        }
        
        invitation.decline();
        invitationRepository.save(invitation);
    }
}
