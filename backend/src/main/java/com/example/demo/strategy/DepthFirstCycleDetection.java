package com.example.demo.strategy;

import com.example.demo.repository.DependencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DFS-based implementation of cycle detection.
 */
@Component("dfsCycleDetection") // named bean, useful if you add more strategies
@RequiredArgsConstructor
public class DepthFirstCycleDetection implements CycleDetectionStrategy {

    private final DependencyRepository dependencyRepo;

    @Override
    public boolean createsCycle(Long taskId, Long dependsOnId) {
        return hasPath(dependsOnId, taskId);
    }

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
