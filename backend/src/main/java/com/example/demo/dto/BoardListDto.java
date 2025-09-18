package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardListDto {
    private Long id;
    private String name;
    private int position;
    private LocalDateTime createdAt;
    private List<TaskDto> tasks; // include tasks
}
