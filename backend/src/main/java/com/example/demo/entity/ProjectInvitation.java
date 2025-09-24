package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Manages project collaboration invitations with expiration and status tracking.
 * Uses secure tokens for invitation links.
 */
@Entity
@Table(name = "project_invitation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProjectInvitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_user_id", nullable = false)
    private User invitedBy;
    
    @Column(name = "invited_email", nullable = false, length = 100)
    private String invitedEmail;
    
    @Column(name = "role", nullable = false, length = 255)
    private String role;
    
    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 255)
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    // Constructor for creating a new invitation
    public ProjectInvitation(Project project, User invitedBy, String invitedEmail, String role, int expirationHours) {
        this.project = project;
        this.invitedBy = invitedBy;
        this.invitedEmail = invitedEmail;
        this.role = role;
        this.token = UUID.randomUUID().toString();
        this.status = InvitationStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(expirationHours);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isPending() {
        return status == InvitationStatus.PENDING && !isExpired();
    }
    
    public void accept() {
        this.status = InvitationStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }
    
    public void decline() {
        this.status = InvitationStatus.DECLINED;
        this.respondedAt = LocalDateTime.now();
    }
    
    public enum InvitationStatus {
        PENDING, ACCEPTED, DECLINED, EXPIRED
    }
}
