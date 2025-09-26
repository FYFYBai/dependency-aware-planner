package com.example.demo.dto;

import com.example.demo.entity.Dependency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DependencyDto {
    private Long id;
    private Long taskId;
    private Long dependsOnId;

public static DependencyDto from(Dependency d) {
    Long taskId = (d.getTask() != null) ? d.getTask().getId() : null;
    Long dependsOnId = (d.getDependsOn() != null) ? d.getDependsOn().getId() : null;

    return new DependencyDto(
        d.getId(),
        taskId,
        dependsOnId
    );
}
}
