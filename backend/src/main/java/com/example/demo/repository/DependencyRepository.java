package com.example.demo.repository;

import com.example.demo.entity.Dependency;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    List<Dependency> findByTaskId(Long taskId);
    boolean existsByTaskIdAndDependsOnId(Long taskId, Long dependsOnId);

    // Handy for reverse lookups (what tasks are blocked by X)
    List<Dependency> findByDependsOnId(Long dependsOnId);
    Optional<Dependency> findByTaskIdAndDependsOnId(Long taskId, Long dependsOnId);

}
