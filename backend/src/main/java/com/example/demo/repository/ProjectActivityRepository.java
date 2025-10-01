package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.ProjectActivity;

public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long> {
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId ORDER BY pa.timestamp DESC")
    List<ProjectActivity> findByProjectIdOrderByTimestampDesc(@Param("projectId") Long projectId);
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId ORDER BY pa.timestamp DESC")
    Page<ProjectActivity> findByProjectIdOrderByTimestampDesc(@Param("projectId") Long projectId, Pageable pageable);
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId " +
           "AND pa.timestamp BETWEEN :startDate AND :endDate ORDER BY pa.timestamp DESC")
    List<ProjectActivity> findByProjectIdAndTimestampBetween(
        @Param("projectId") Long projectId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId " +
           "AND pa.user.id = :userId ORDER BY pa.timestamp DESC")
    List<ProjectActivity> findByProjectIdAndUserIdOrderByTimestampDesc(
        @Param("projectId") Long projectId,
        @Param("userId") Long userId
    );
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId " +
           "AND pa.activityType = :activityType ORDER BY pa.timestamp DESC")
    List<ProjectActivity> findByProjectIdAndActivityTypeOrderByTimestampDesc(
        @Param("projectId") Long projectId,
        @Param("activityType") ProjectActivity.ActivityType activityType
    );
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId ORDER BY pa.timestamp DESC")
    List<ProjectActivity> findTopNByProjectIdOrderByTimestampDesc(@Param("projectId") Long projectId, Pageable pageable);
    
    @Query("SELECT pa.activityType, COUNT(pa) FROM ProjectActivity pa WHERE pa.project.id = :projectId GROUP BY pa.activityType")
    List<Object[]> countActivitiesByTypeForProject(@Param("projectId") Long projectId);
    
    @Query("SELECT pa FROM ProjectActivity pa WHERE pa.project.id = :projectId " +
           "AND pa.entityType = :entityType AND pa.entityId = :entityId ORDER BY pa.timestamp DESC")
    List<ProjectActivity> findByProjectIdAndEntityTypeAndEntityIdOrderByTimestampDesc(
        @Param("projectId") Long projectId,
        @Param("entityType") String entityType,
        @Param("entityId") Long entityId
    );
}
