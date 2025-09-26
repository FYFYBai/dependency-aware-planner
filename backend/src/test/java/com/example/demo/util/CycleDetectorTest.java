package com.example.demo.util;

import com.example.demo.entity.Dependency;
import com.example.demo.entity.Task;
import com.example.demo.repository.DependencyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CycleDetector.
 * Uses a mocked DependencyRepository so no DB is required.
 */
class CycleDetectorTest {

    private DependencyRepository dependencyRepo;
    private CycleDetector cycleDetector;

    @BeforeEach
    void setup() {
        dependencyRepo = mock(DependencyRepository.class);
        cycleDetector = new CycleDetector(dependencyRepo);
    }

    @Test
    void testNoCycle() {
        // A -> B
        when(dependencyRepo.findByTaskId(1L))
                .thenReturn(List.of(makeDep(1L, 2L)));

        // B has no deps
        when(dependencyRepo.findByTaskId(2L))
                .thenReturn(List.of());

        assertFalse(cycleDetector.createsCycle(1L, 2L));
    }

    @Test
    void testDirectCycle() {
        // A -> B, trying to add B -> A
        when(dependencyRepo.findByTaskId(2L))
                .thenReturn(List.of(makeDep(2L, 1L)));

        assertTrue(cycleDetector.createsCycle(1L, 2L)); // adding 1->2 closes loop
    }

    @Test
    void testIndirectCycle() {
        // A -> B, B -> C, C -> A
        when(dependencyRepo.findByTaskId(1L))
                .thenReturn(List.of(makeDep(1L, 2L)));
        when(dependencyRepo.findByTaskId(2L))
                .thenReturn(List.of(makeDep(2L, 3L)));
        when(dependencyRepo.findByTaskId(3L))
                .thenReturn(List.of(makeDep(3L, 1L)));

        assertTrue(cycleDetector.createsCycle(1L, 2L));
    }

    private Dependency makeDep(Long taskId, Long dependsOnId) {
        Dependency d = new Dependency();
        Task t1 = new Task(); t1.setId(taskId);
        Task t2 = new Task(); t2.setId(dependsOnId);
        d.setTask(t1);
        d.setDependsOn(t2);
        return d;
    }
}
