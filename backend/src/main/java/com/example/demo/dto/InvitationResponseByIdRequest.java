package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvitationResponseByIdRequest {
    
    @NotNull(message = "Invitation ID is required")
    private Long id;
    
    @NotBlank(message = "Response is required")
    private String response;
}
