package com.example.demo.strategy;

/**
 * Strategy interface for detecting cycles in task dependencies.
 */
public interface CycleDetectionStrategy {

    /**
     * Checks if adding (taskId -> dependsOnId) would create a cycle.
     *
     * @param taskId      the task that depends on another
     * @param dependsOnId the prerequisite task
     * @return true if adding the dependency creates a cycle
     */
    boolean createsCycle(Long taskId, Long dependsOnId);
}
