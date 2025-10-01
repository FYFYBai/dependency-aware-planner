package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ProjectActivityDto;
import com.example.demo.entity.ProjectActivity;
import com.example.demo.service.ProjectActivityService;
import com.example.demo.service.ProjectCollaborationService;

/**
 * REST API controller for project activity history and audit logs.
 * Provides endpoints to retrieve project activity history with various filtering options.
 * All endpoints require user authentication and project collaboration access.
 */
@RestController
@RequestMapping("/api/projects/{projectId}/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectActivityController {
    
    @Autowired
    private ProjectActivityService activityService;
    
    @Autowired
    private ProjectCollaborationService collaborationService;
    
    @GetMapping
    public ResponseEntity<List<ProjectActivityDto>> getProjectActivities(
            @PathVariable Long projectId,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        // Check if user has access to the project
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ProjectActivityDto> activities = activityService.getProjectActivities(projectId);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<ProjectActivityDto>> getProjectActivitiesPaginated(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        Page<ProjectActivityDto> activities = activityService.getProjectActivities(projectId, page, size);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<ProjectActivityDto>> getRecentActivities(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ProjectActivityDto> activities = activityService.getRecentProjectActivities(projectId, limit);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<ProjectActivityDto>> getActivitiesByDateRange(
            @PathVariable Long projectId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        
        List<ProjectActivityDto> activities = activityService.getProjectActivitiesByDateRange(projectId, start, end);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectActivityDto>> getUserActivities(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ProjectActivityDto> activities = activityService.getUserActivities(projectId, userId);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/type/{activityType}")
    public ResponseEntity<List<ProjectActivityDto>> getActivitiesByType(
            @PathVariable Long projectId,
            @PathVariable String activityType,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        try {
            ProjectActivity.ActivityType type = ProjectActivity.ActivityType.valueOf(activityType.toUpperCase());
            List<ProjectActivityDto> activities = activityService.getActivitiesByType(projectId, type);
            return ResponseEntity.ok(activities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<ProjectActivityDto>> getEntityActivities(
            @PathVariable Long projectId,
            @PathVariable String entityType,
            @PathVariable Long entityId,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ProjectActivityDto> activities = activityService.getEntityActivities(projectId, entityType, entityId);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<List<Object[]>> getActivityStatistics(
            @PathVariable Long projectId,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        if (!collaborationService.isProjectCollaborator(projectId, username)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Object[]> statistics = activityService.getActivityStatistics(projectId);
        return ResponseEntity.ok(statistics);
    }
}
