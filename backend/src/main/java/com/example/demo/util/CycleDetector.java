package com.example.demo.util;

import com.example.demo.repository.DependencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Utility for detecting cycles in task dependency graphs.
 * Uses DFS to check if adding a new edge would create a cycle.
 */
@Component
@RequiredArgsConstructor
public class CycleDetector {

    private final DependencyRepository dependencyRepo;

    /**
     * Check if adding (taskId -> dependsOnId) creates a cycle.
     *
     * @param taskId       The task that depends on another
     * @param dependsOnId  The prerequisite task
     * @return true if this edge would create a cycle, false otherwise
     */
    public boolean createsCycle(Long taskId, Long dependsOnId) {
        return hasPath(dependsOnId, taskId);
    }

    /**
     * Depth-first search: is there a path from startId → targetId?
     */
    private boolean hasPath(Long startId, Long targetId) {
        List<Long> directDeps = dependencyRepo.findByTaskId(startId)
                .stream()
                .map(d -> d.getDependsOn().getId())
                .toList();

        if (directDeps.contains(targetId)) {
            return true;
        }

        for (Long dep : directDeps) {
            if (hasPath(dep, targetId)) {
                return true;
            }
        }

        return false;
    }
}
