package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    private Integer position;   // for ordering
    private Long listId;        // for list relation

    // list of dependency task IDs
    // Always non-null on serialization
    private List<Long> dependencyIds = new ArrayList<>();
}
