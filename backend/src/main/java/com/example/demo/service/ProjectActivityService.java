package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ProjectActivityDto;
import com.example.demo.entity.Project;
import com.example.demo.entity.ProjectActivity;
import com.example.demo.entity.User;
import com.example.demo.repository.ProjectActivityRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.UserRepository;

/**
 * Service responsible for logging and retrieving project activity history.
 * Provides methods to track user actions and query activity logs with various filters.
 */
@Service
@Transactional
public class ProjectActivityService {
    
    @Autowired
    private ProjectActivityRepository activityRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Logs a basic activity without tracking old/new values.
     * Used for simple actions like creation, deletion, or status changes.
     */
    public void logActivity(Long projectId, String username, ProjectActivity.ActivityType activityType,
                           String entityType, Long entityId, String entityName, String action, String description) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProjectActivity activity = new ProjectActivity(
                project, user, activityType, entityType, entityId, entityName, action, description
        );
        
        activityRepository.save(activity);
    }
    
    /**
     * Logs an activity with old and new values for tracking changes.
     * Used for update operations where we need to track what changed.
     */
    public void logActivityWithValues(Long projectId, String username, ProjectActivity.ActivityType activityType,
                                     String entityType, Long entityId, String entityName, String action, 
                                     String description, String oldValues, String newValues) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProjectActivity activity = new ProjectActivity(
                project, user, activityType, entityType, entityId, entityName, action, description, oldValues, newValues
        );
        
        activityRepository.save(activity);
    }
    
    /**
     * Retrieves all activities for a project ordered by most recent first.
     * Use with caution for projects with high activity volume.
     */
    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getProjectActivities(Long projectId) {
        List<ProjectActivity> activities = activityRepository.findByProjectIdOrderByTimestampDesc(projectId);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .toList();
    }
    
    /**
     * Retrieves paginated activities for a project.
     * Recommended for projects with high activity volume to avoid performance issues.
     */
    @Transactional(readOnly = true)
    public Page<ProjectActivityDto> getProjectActivities(Long projectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProjectActivity> activities = activityRepository.findByProjectIdOrderByTimestampDesc(projectId, pageable);
        return activities.map(ProjectActivityDto::fromEntity);
    }
    
    /**
     * Retrieves the most recent activities for a project.
     * Ideal for displaying recent activity feeds or dashboards.
     */
    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getRecentProjectActivities(Long projectId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ProjectActivity> activities = activityRepository.findTopNByProjectIdOrderByTimestampDesc(projectId, pageable);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getProjectActivitiesByDateRange(Long projectId, LocalDateTime startDate, LocalDateTime endDate) {
        List<ProjectActivity> activities = activityRepository.findByProjectIdAndTimestampBetween(projectId, startDate, endDate);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getUserActivities(Long projectId, Long userId) {
        List<ProjectActivity> activities = activityRepository.findByProjectIdAndUserIdOrderByTimestampDesc(projectId, userId);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getActivitiesByType(Long projectId, ProjectActivity.ActivityType activityType) {
        List<ProjectActivity> activities = activityRepository.findByProjectIdAndActivityTypeOrderByTimestampDesc(projectId, activityType);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<ProjectActivityDto> getEntityActivities(Long projectId, String entityType, Long entityId) {
        List<ProjectActivity> activities = activityRepository.findByProjectIdAndEntityTypeAndEntityIdOrderByTimestampDesc(projectId, entityType, entityId);
        return activities.stream()
                .map(ProjectActivityDto::fromEntity)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<Object[]> getActivityStatistics(Long projectId) {
        return activityRepository.countActivitiesByTypeForProject(projectId);
    }
    /**
     * Convenience methods for logging common task operations.
     * These methods provide standardized activity descriptions for better consistency.
     */
    public void logTaskCreated(Long projectId, String username, Long taskId, String taskName) {
        logActivity(projectId, username, ProjectActivity.ActivityType.TASK_CREATED, 
                   "TASK", taskId, taskName, "CREATED", 
                   "Created task: " + taskName);
    }
    
    public void logTaskUpdated(Long projectId, String username, Long taskId, String taskName, 
                              String oldValues, String newValues) {
        logActivityWithValues(projectId, username, ProjectActivity.ActivityType.TASK_UPDATED, 
                             "TASK", taskId, taskName, "UPDATED", 
                             "Updated task: " + taskName, oldValues, newValues);
    }
    
    public void logTaskDeleted(Long projectId, String username, Long taskId, String taskName) {
        logActivity(projectId, username, ProjectActivity.ActivityType.TASK_DELETED, 
                   "TASK", taskId, taskName, "DELETED", 
                   "Deleted task: " + taskName);
    }
    
    public void logTaskMoved(Long projectId, String username, Long taskId, String taskName, 
                            String fromList, String toList) {
        logActivity(projectId, username, ProjectActivity.ActivityType.TASK_MOVED, 
                   "TASK", taskId, taskName, "MOVED", 
                   "Moved task '" + taskName + "' from " + fromList + " to " + toList);
    }
    
    public void logListCreated(Long projectId, String username, Long listId, String listName) {
        logActivity(projectId, username, ProjectActivity.ActivityType.LIST_CREATED, 
                   "LIST", listId, listName, "CREATED", 
                   "Created list: " + listName);
    }
    
    public void logListUpdated(Long projectId, String username, Long listId, String listName, 
                              String oldValues, String newValues) {
        logActivityWithValues(projectId, username, ProjectActivity.ActivityType.LIST_UPDATED, 
                             "LIST", listId, listName, "UPDATED", 
                             "Updated list: " + listName, oldValues, newValues);
    }
    
    public void logListDeleted(Long projectId, String username, Long listId, String listName) {
        logActivity(projectId, username, ProjectActivity.ActivityType.LIST_DELETED, 
                   "LIST", listId, listName, "DELETED", 
                   "Deleted list: " + listName);
    }
    
    public void logCollaboratorInvited(Long projectId, String username, String invitedEmail, String role) {
        logActivity(projectId, username, ProjectActivity.ActivityType.COLLABORATOR_INVITED, 
                   "COLLABORATOR", null, invitedEmail, "INVITED", 
                   "Invited " + invitedEmail + " as " + role);
    }
    
    public void logCollaboratorJoined(Long projectId, String username, String role) {
        logActivity(projectId, username, ProjectActivity.ActivityType.COLLABORATOR_JOINED, 
                   "COLLABORATOR", null, username, "JOINED", 
                   username + " joined the project as " + role);
    }
    
    public void logCollaboratorLeft(Long projectId, String username, String removedUsername) {
        logActivity(projectId, username, ProjectActivity.ActivityType.COLLABORATOR_LEFT, 
                   "COLLABORATOR", null, removedUsername, "LEFT", 
                   "Removed " + removedUsername + " from the project");
    }
    
    public void logDependencyAdded(Long projectId, String username, String taskName, String dependsOnTaskName) {
        logActivity(projectId, username, ProjectActivity.ActivityType.DEPENDENCY_ADDED, 
                   "DEPENDENCY", null, taskName, "ADDED", 
                   "Added dependency: " + taskName + " depends on " + dependsOnTaskName);
    }
    
    public void logDependencyRemoved(Long projectId, String username, String taskName, String dependsOnTaskName) {
        logActivity(projectId, username, ProjectActivity.ActivityType.DEPENDENCY_REMOVED, 
                   "DEPENDENCY", null, taskName, "REMOVED", 
                   "Removed dependency: " + taskName + " no longer depends on " + dependsOnTaskName);
    }
}
