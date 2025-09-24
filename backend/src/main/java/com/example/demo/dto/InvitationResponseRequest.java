package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponseRequest {
    
    @NotBlank(message = "Token is required")
    private String token;
    
    @NotBlank(message = "Response is required")
    private String response; // "accept" or "decline"
}
