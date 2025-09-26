package com.example.demo.controller;

import com.example.demo.dto.DependencyDto;
import com.example.demo.entity.Dependency;
import com.example.demo.service.DependencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing task dependencies.
 *
 * A dependency means that one task (taskId) cannot start or complete
 * until another task (dependsOnId) has been finished.
 *
 * Endpoints:
 *  - POST   /tasks/{taskId}/dependencies       → add a dependency
 *  - DELETE /tasks/{taskId}/dependencies/{id} → remove a dependency
 *  - GET    /tasks/{taskId}/dependencies       → list prerequisites
 *  - GET    /tasks/{taskId}/dependencies/dependents → list dependents
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tasks/{taskId}/dependencies")
public class DependencyController {

    private final DependencyService dependencyService;

    /**
     * Add a dependency: taskId depends on dependsOnId.
     * Request body: { "dependsOnId": 123 }
     * Response: the created Dependency object (with id).
     */
    @PostMapping
    public ResponseEntity<DependencyDto> addDependency(
            @PathVariable Long taskId,
            @RequestBody Map<String, Long> body) {

        Long dependsOnId = body.get("dependsOnId");
        log.info("DEBUG dependsOnId={}, taskId={}", dependsOnId, taskId);

        Dependency dep = dependencyService.addDependency(taskId, dependsOnId);
        return ResponseEntity.ok(DependencyDto.from(dep));
    }


    /**
     * Remove a dependency (by dependency id) for a specific task.
     */
    @DeleteMapping("/{dependsOnId}")
    public ResponseEntity<Void> removeDependency(
            @PathVariable Long taskId,
            @PathVariable Long dependsOnId) {

        dependencyService.removeByTaskAndDependsOn(taskId, dependsOnId);
        return ResponseEntity.noContent().build();
    }


    /**
     * List all prerequisites of a given task (the tasks that must be done first).
     */
    @GetMapping
    public List<DependencyDto> listDependencies(@PathVariable Long taskId) {
        return dependencyService.getDependenciesOf(taskId)
                .stream()
                .map(DependencyDto::from)
                .toList();
    }

    /**
     * Reverse lookup: list tasks that are blocked by this task.
     */
    @GetMapping("/dependents")
    public List<DependencyDto> listDependents(@PathVariable Long taskId) {
        return dependencyService.getDependentsOf(taskId)
                .stream()
                .map(DependencyDto::from)
                .toList();
    }
}
