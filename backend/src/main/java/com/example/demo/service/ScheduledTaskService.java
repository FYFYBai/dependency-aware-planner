package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Handles scheduled tasks for the application.
 */
@Service
public class ScheduledTaskService {
    
    @Autowired
    private ProjectCollaborationService collaborationService;
    
    /**
     * Clean up expired invitations every hour to keep the database clean.
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredInvitations() {
        collaborationService.cleanupExpiredInvitations();
    }
}
