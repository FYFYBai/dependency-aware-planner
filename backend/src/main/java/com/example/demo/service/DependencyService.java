package com.example.demo.service;

import com.example.demo.entity.Dependency;
import com.example.demo.entity.Task;
import com.example.demo.repository.DependencyRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.strategy.CycleDetectionStrategy;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer responsible for managing task dependencies.
 * Validates dependency rules (same project, no self-dependency, no cycles)
 * before persisting to the database.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DependencyService {

    private final DependencyRepository dependencyRepo;
    private final TaskRepository taskRepo;
    private final CycleDetectionStrategy cycleDetectionStrategy;

    /**
     * Add a dependency (taskId -> dependsOnId).
     *
     * @param taskId       the task that will depend on another
     * @param dependsOnId  the prerequisite task
     * @return persisted Dependency entity
     * @throws IllegalArgumentException   if validation fails (self-dependency, cross-project, cycle, duplicate)
     * @throws EntityNotFoundException    if either task does not exist
     */
    public Dependency addDependency(Long taskId, Long dependsOnId) {
        if (taskId.equals(dependsOnId)) {
            throw new IllegalArgumentException("Task cannot depend on itself.");
        }
        if (dependencyRepo.existsByTaskIdAndDependsOnId(taskId, dependsOnId)) {
            throw new IllegalArgumentException("Dependency already exists.");
        }

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task " + taskId + " not found"));
        Task dependsOn = taskRepo.findById(dependsOnId)
                .orElseThrow(() -> new EntityNotFoundException("Task " + dependsOnId + " not found"));

        Long projectId1 = resolveProjectId(task);
        Long projectId2 = resolveProjectId(dependsOn);
        if (!projectId1.equals(projectId2)) {
            throw new IllegalArgumentException("Tasks must belong to the same project.");
        }

        if (cycleDetectionStrategy.createsCycle(taskId, dependsOnId)) {
            throw new IllegalArgumentException("Adding this dependency would create a cycle.");
        }

        Dependency dep = new Dependency();
        dep.setTask(task);
        dep.setDependsOn(dependsOn);
        return dependencyRepo.save(dep);
    }

    /**
     * Remove an existing dependency between two tasks.
     *
     * @param taskId       the dependent task id
     * @param dependsOnId  the prerequisite task id
     * @throws EntityNotFoundException if the dependency does not exist
     */
    public void removeByTaskAndDependsOn(Long taskId, Long dependsOnId) {
        Dependency existing = dependencyRepo.findByTaskIdAndDependsOnId(taskId, dependsOnId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Dependency not found for task=" + taskId + " dependsOn=" + dependsOnId
                ));
        dependencyRepo.delete(existing);
    }

    /**
     * Retrieve all dependencies (prerequisites) of a given task.
     *
     * @param taskId the task id
     * @return list of Dependency entities where taskId is the dependent task
     */
    @Transactional(readOnly = true)
    public List<Dependency> getDependenciesOf(Long taskId) {
        return dependencyRepo.findByTaskId(taskId);
    }

    /**
     * Retrieve all dependents (tasks blocked by a given prerequisite task).
     *
     * @param dependsOnId the prerequisite task id
     * @return list of Dependency entities where dependsOnId is the prerequisite
     */
    @Transactional(readOnly = true)
    public List<Dependency> getDependentsOf(Long dependsOnId) {
        return dependencyRepo.findByDependsOnId(dependsOnId);
    }

    /**
     * Resolve the project id associated with a task. Supports both direct and indirect associations.
     * A task may link directly to a project via project_id, or indirectly via its board list.
     *
     * @param task Task entity (must be loaded from repository)
     * @return the resolved project id
     * @throws IllegalArgumentException if no project association can be determined
     */
    private Long resolveProjectId(Task task) {
        if (task.getProject() != null) {
            return task.getProject().getId();
        } else if (task.getList() != null && task.getList().getProject() != null) {
            return task.getList().getProject().getId();
        }
        throw new IllegalArgumentException("Task " + task.getId() + " has no project association.");
    }
}
